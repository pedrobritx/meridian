const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Small, safe Markdown subset for the changelog: headings, bullets, inline code, links, emphasis.
function inline(text){
  return escape(text)
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g,'<a class="md-link" href="$2">$1</a>');
}
export function markdown(source){
  const out=[];let list=false;
  for(const line of source.split('\n')){
    const item=line.match(/^- (.*)/);
    if(!item&&list){out.push('</ul>');list=false;}
    if(/^# /.test(line))continue;
    const h=line.match(/^(#{2,3}) (.*)/);
    if(h){out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);continue;}
    if(item){if(!list){out.push('<ul class="changelog-list">');list=true;}out.push(`<li>${inline(item[1])}</li>`);continue;}
    if(line.trim())out.push(`<p>${inline(line)}</p>`);
  }
  if(list)out.push('</ul>');
  return out.join('\n');
}

