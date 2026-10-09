const repo = "https://api.github.com/repos/pedrobritx/meridian";
const status = document.querySelector("#status"),
  tokenInput = document.querySelector("#token"),
  live = document.querySelector("#live"),
  forestLive = document.querySelector("#forest-live"),
  forestStatus = document.querySelector("#forest-status");
let sessionToken = "",
  base = null,
  lastPublished = "",
  pending = null,
  busy = false,
  forestBase = null;
const tell = (text) => {
  status.textContent = text;
};
function credentials() {
  if (tokenInput.value.trim()) {
    sessionToken = tokenInput.value.trim();
    tokenInput.value = "";
  }
  return sessionToken;
}
function rpc(type, data = {}) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending = null;
      reject(Error("Figma did not respond. Reopen the plugin."));
    }, 30000);
    pending = { resolve, reject, timeout };
    parent.postMessage({ pluginMessage: { type, ...data } }, "*");
  });
}
onmessage = (event) => {
  const m = event.data.pluginMessage;
  if (!m || !pending) return;
  const p = pending;
  pending = null;
  clearTimeout(p.timeout);
  m.type === "error" ? p.reject(Error(m.message)) : p.resolve(m);
};
async function remote() {
  const headers = {
    Accept: "application/vnd.github+json",
    ...(credentials() ? { Authorization: "Bearer " + sessionToken } : {}),
  };
  const ref = await fetch(repo + "/git/ref/heads/main", {
    headers,
    cache: "no-store",
  });
  if (!ref.ok)
    throw Error("GitHub reference read failed (" + ref.status + ").");
  const sha = (await ref.json()).object.sha;
  const get = async (path) => {
    const response = await fetch(
      repo + "/contents/" + path + "?ref=" + encodeURIComponent(sha),
      {
        headers: {
          Accept: "application/vnd.github+json",
          ...(credentials() ? { Authorization: "Bearer " + sessionToken } : {}),
        },
      },
    );
    if (!response.ok)
      throw Error(
        "GitHub read failed (" +
          response.status +
          "). Check access to Meridian.",
      );
    const file = await response.json();
    return JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(file.content.replaceAll("\n", "")), (c) =>
          c.charCodeAt(0),
        ),
      ),
    );
  };
  const [tokens, content] = await Promise.all([
    get("design/figma/generated/tokens.json"),
    get("site/content.json"),
  ]);
  return {
    tokens: validateTokens(tokens, { fileKey, themeModes: modes }),
    content: validateContent(content, contentTemplate),
  };
}
async function digest(value) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(signature(value))),
  );
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
async function publish(local, currentRemote) {
  if (!credentials())
    throw Error("Enter a GitHub token with Contents write on meridian.");
  // Twelve appearances exceed repository_dispatch's 64KiB client payload limit.
  // Store the complete contract as an immutable Git blob, then dispatch its SHA.
  const blob = await fetch(repo + "/git/blobs", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + sessionToken,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: JSON.stringify(local), encoding: "utf-8" }),
  });
  if (!blob.ok) throw Error("GitHub contract upload failed (" + blob.status + ").");
  const blobSha = (await blob.json()).sha;
  if (!/^[a-f0-9]{40}$/.test(blobSha)) throw Error("GitHub returned an invalid contract reference.");
  const response = await fetch(repo + "/dispatches", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + sessionToken,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event_type: "figma-tokens",
      client_payload: {
        file_key: fileKey,
        bundle_blob_sha: blobSha,
        base_hash: await digest(currentRemote),
      },
    }),
  });
  if (!response.ok)
    throw Error("GitHub publish failed (" + response.status + ").");
  lastPublished = signature(local);
  tell(
    "Published for review. The site updates when the export PR reaches main. Check Figma Design Sync for its result.",
  );
}
async function compare(action = "compare") {
  const currentRemote = await remote(),
    capture = await rpc("export"),
    local = { tokens: capture.tokens, content: capture.content },
    direction = syncDirection(base, local, currentRemote);
  if (action === "import" || (action === "watch" && direction === "import")) {
    if (action === "watch" && signature(local) !== signature(base))
      throw Error("Local edits changed. Import paused.");
    const result = await rpc("import", {
      bundle: currentRemote,
      expectedLocalSignature: signature(local),
    });
    const applied = { tokens: result.tokens, content: result.content };
    if (signature(applied) !== signature(currentRemote))
      throw Error("Imported values differ. Compare again.");
    base = currentRemote;
    lastPublished = "";
    tell(
      "GitHub values applied to Figma. Aliases and editable layers retained.",
    );
    return;
  }
  if (action === "publish" || (action === "watch" && direction === "publish")) {
    if (action === "watch" && lastPublished === signature(local)) return;
    await publish(local, currentRemote);
    if (!base) base = currentRemote;
    return;
  }
  if (direction === "equal") {
    base = currentRemote;
    lastPublished = "";
    tell("Figma and GitHub match. The site builds from these values.");
    return;
  }
  if (direction === "conflict") {
    live.checked = false;
    tell(
      "Both Figma and GitHub changed. Live sync paused. Review the two versions before explicitly choosing import or publish.",
    );
    return;
  }
  if (direction === "choose") {
    live.checked = false;
    tell(
      "Figma and GitHub differ. Choose Apply GitHub values or Publish Figma for review to establish the baseline.",
    );
    return;
  }
  tell(
    direction === "import"
      ? "GitHub changed. Apply its values to Figma."
      : "Figma changed. Publish its values for review.",
  );
}
async function run(fn) {
  if (busy) return;
  busy = true;
  document.querySelectorAll("button").forEach((b) => (b.disabled = true));
  try {
    await fn();
  } catch (error) {
    live.checked = false;
    tell(error.message);
  } finally {
    busy = false;
    document.querySelectorAll("button").forEach((b) => (b.disabled = false));
  }
}
document.querySelector("#compare").onclick = () => run(() => compare());
document.querySelector("#import").onclick = () => run(() => compare("import"));
document.querySelector("#publish").onclick = () =>
  run(() => compare("publish"));
document.querySelector("#download").onclick = () =>
  run(async () => {
    const capture = await rpc("export"),
      url = URL.createObjectURL(
        new Blob(
          [
            JSON.stringify(
              { tokens: capture.tokens, content: capture.content },
              null,
              2,
            ),
          ],
          { type: "application/json" },
        ),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = "meridian-contract.json";
    a.click();
    URL.revokeObjectURL(url);
    tell("Shared contract downloaded.");
  });
document.querySelector("#disconnect").onclick = () => {
  sessionToken = "";
  tokenInput.value = "";
  base = null;
  lastPublished = "";
  live.checked = false;
  forestLive.checked = false;
  forestBase = null;
  tellForest("Disconnected; Forest automatic sync stopped.");
  tell("Disconnected. No credential was stored.");
};
live.onchange = () => {
  if (live.checked)
    run(async () => {
      if (!credentials())
        throw Error(
          "Live sync requires a session GitHub token to avoid anonymous API limits.",
        );
      await compare("watch");
    });
};
setInterval(() => {
  if (live.checked && !busy) run(() => compare("watch"));
}, 30000);

/**
 * Forest is independently versioned from Core tokens. It may be auto-applied
 * only after the first confirmed clean baseline in the open plugin session.
 * Figma editing and browser network access cease when the plugin closes.
 */
const tellForest=(message)=>{forestStatus.textContent=message;};
async function remoteForest() {
  const headers={Accept:'application/vnd.github+json',
    ...(credentials()?{Authorization:'Bearer '+sessionToken}:{})};
  const response=await fetch(repo+'/git/ref/heads/main',{headers,cache:'no-store'});
  if(!response.ok)throw Error('Could not read Meridian main for Forest ('+response.status+').');
  const sha=(await response.json()).object.sha;
  const file=await fetch(repo+'/contents/design/figma/forest-lab.json?ref='+encodeURIComponent(sha),{headers});
  if(!file.ok)throw Error('Could not read approved Forest contract ('+file.status+').');
  const payload=await file.json();
  const data=JSON.parse(new TextDecoder().decode(
    Uint8Array.from(atob(payload.content.replaceAll('\n','')),(x)=>x.charCodeAt(0))
  ));
  return validateForestContract(data,forestTemplate);
}
async function compareForest(action='compare') {
  const currentRemote=await remoteForest();
  const currentLocal=(await rpc('exportForest')).forest;
  const direction=syncDirection(forestBase,currentLocal,currentRemote);
  if(action==='import'||(action==='watch'&&direction==='import')) {
    if(action==='watch'&&signature(currentLocal)!==signature(forestBase))
      throw Error('Figma Forest changed locally; automatic import stopped.');
    const result=await rpc('importForest',{
      forest:currentRemote,expectedLocalSignature:signature(currentLocal)
    });
    if(signature(result.forest)!==signature(currentRemote))
      throw Error('Forest import failed verification.');
    forestBase=currentRemote;
    tellForest('Forest Lab matches GitHub main · '+result.variableCells+
      ' variable cells and '+result.textNodes+' text nodes updated.');
    return;
  }
  if(direction==='equal') {
    forestBase=currentRemote;
    tellForest('Forest Lab matches GitHub main. Automatic Lab updates can continue while open.');
  }else if(direction==='choose') {
    forestLive.checked=false;
    tellForest('Forest Lab differs from GitHub. Compare and explicitly Apply Forest before enabling automatic sync.');
  }else if(direction==='conflict') {
    forestLive.checked=false;
    tellForest('Forest Lab and GitHub both changed. Automatic sync paused; resolve differences before importing.');
  }else if(direction==='publish') {
    forestLive.checked=false;
    tellForest('Figma Forest was edited. Automatic sync paused; document or review the change in GitHub.');
  }else {
    tellForest('GitHub Forest changed. Apply Forest values or enable safe auto-apply after a clean baseline.');
  }
}
document.querySelector('#forest-compare').onclick=()=>run(()=>compareForest());
document.querySelector('#forest-import').onclick=()=>run(()=>compareForest('import'));
forestLive.onchange=()=>{
  if(forestLive.checked)run(async()=>{
    if(!credentials())throw Error('An in-session GitHub token is required for automatic Lab polling.');
    await compareForest('watch');
  });
};
setInterval(()=>{
  if(forestLive.checked&&!busy)
    run(async()=>{try{await compareForest('watch');}
      catch(error){forestLive.checked=false;tellForest(error.message);}});
},30000);
