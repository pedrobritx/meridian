import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const routes = [
  "overview",
  "profiles",
  "foundations",
  "components",
  "symbols",
  "patterns",
  "adoption",
];
for (const profile of ["core", "grass", "paper", "parallel", "canvas", "gallery"])
  for (const environment of ["dawn", "dusk"])
    test(`${profile}/${environment}: all pages render without overflow or axe AA violations`, async ({
      page,
    }) => {
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("");
      await page.getByLabel("Profile", { exact: true }).selectOption(profile);
      await page
        .getByLabel("Environment", { exact: true })
        .selectOption(environment);
      for (const route of routes) {
        await page.goto(`#${route}`);
        await expect(page.locator("main h1")).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          route,
        ).toBeTruthy();
        const result = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(
          result.violations,
          `${environment}/${route}: ${JSON.stringify(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
        ).toEqual([]);
      }
      expect(errors).toEqual([]);
    });
test("tabs support keyboard navigation and dialog restores focus", async ({
  page,
}) => {
  await page.goto("#components");
  const tab = page.getByRole("tab", { name: "Purpose" });
  await tab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Behaviour" })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("Left and Right");
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: "Accessibility" }),
  ).toHaveAttribute("aria-selected", "true");
  const opener = page.getByRole("button", { name: "Open dialog example" });
  await opener.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(opener).toBeFocused();
});
test("form validation explains error and confirms only local validation", async ({
  page,
}) => {
  await page.goto("#patterns");
  await page.getByRole("button", { name: "Try saving preferences" }).click();
  const name = page.getByLabel("Display name");
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toBeFocused();
  await name.fill("Test reader");
  await page.getByRole("button", { name: "Try saving preferences" }).click();
  await expect(name).not.toHaveAttribute("aria-invalid");
  await expect(page.locator("#form-status")).toContainText(
    "No data was stored",
  );
});
test("theme persists, system preference follows the device, and reduced motion stops spinner", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("#components");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page
      .locator(".spinner")
      .evaluateAll((els) => els.every(el=>getComputedStyle(el).animationName === "none")),
  ).toBe(true);
  await page.getByLabel("Environment", { exact: true }).selectOption("dawn");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByLabel("Environment", { exact: true }).selectOption("system");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("only the selected segment is bold and list hover belongs to one rounded row", async ({
  page,
}, testInfo) => {
  await page.goto("#components");
  for (const name of ["Behaviour", "Accessibility", "Purpose"]) {
    await page.getByRole("tab", { name }).click();
    for (const tab of await page.getByRole("tab").all()) {
      const selected = (await tab.getAttribute("aria-selected")) === "true";
      expect(await tab.evaluate((el) => getComputedStyle(el).fontWeight)).toBe(
        selected ? "700" : "500",
      );
    }
  }
  await page.goto("#profiles");
  const rows = page.locator(".environment").first().locator(".md-list-row");
  expect(
    await rows.first().evaluate((el) => getComputedStyle(el).borderRadius),
  ).toBe("24px");
  if (testInfo.project.name === "desktop") {
    await rows.first().hover();
    await page.waitForTimeout(160);
    expect(
      await rows.first().evaluate((el) => getComputedStyle(el).backgroundColor),
    ).not.toBe("rgba(0, 0, 0, 0)");
    expect(
      await rows.nth(1).evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe("rgba(0, 0, 0, 0)");
  }
  await page.getByLabel("Profile", { exact: true }).selectOption("paper");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-meridian", "paper");
});

test("glass buttons support keyboard activation and solid preference fallbacks", async ({page}) => {
  await page.goto('#components');
  const glass=page.locator('button.md-button.glass').first();
  await glass.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#announcement')).toContainText('Button option selected');
  const session=await page.context().newCDPSession(page);
  await session.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-transparency',value:'reduce'}]});
  expect(await glass.evaluate(el=>getComputedStyle(el).backdropFilter)).toBe('none');
  const opaque=page.locator('button.md-button.opaque').first();
  expect(await glass.evaluate(el=>getComputedStyle(el).backgroundColor)).toBe(await opaque.evaluate(el=>getComputedStyle(el).backgroundColor));
  await page.emulateMedia({forcedColors:'active'});
  expect(await glass.evaluate(el=>getComputedStyle(el).backdropFilter)).toBe('none');
});
