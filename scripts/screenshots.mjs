import { pathToFileURL } from "node:url";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE
    ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href
    : "playwright"
);
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : {}),
});
const page = await browser.newPage({
  viewport: { width: 1600, height: 1100 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:4173");
await page.locator(".card").first().waitFor();
await mkdir("docs/screenshots", { recursive: true });
await page.screenshot({ path: "docs/screenshots/01-vk-overview.png" });
await page
  .getByRole("button", { name: "Рекламные кампании", exact: true })
  .click();
await page.screenshot({ path: "docs/screenshots/02-vk-campaigns.png" });
await page.locator("#noincome").check();
const count = await page.locator("#rows tr").count();
assert(count > 0);
await page.locator("#noincome").uncheck();
assert((await page.locator("#rows tr").count()) > count);
await page.locator("#search").fill("DOES NOT EXIST");
assert.equal(await page.locator("#rows tr").count(), 0);
await page.locator("#search").fill("");
await page.locator('[data-page="ao"]').click();
await page.screenshot({ path: "docs/screenshots/03-autocall.png" });
await page
  .getByRole("button", { name: "Базы автообзвона", exact: true })
  .click();
await page.screenshot({ path: "docs/screenshots/06-autocall-bases.png" });
await page.locator('[data-page="managers"]').click();
await page.locator("#cohort").check();
await page.screenshot({ path: "docs/screenshots/04-managers.png" });
await page.setViewportSize({ width: 390, height: 844 });
await page.locator('[data-page="vk"]').click();
await page.screenshot({ path: "docs/screenshots/05-mobile.png" });
assert(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
assert.deepEqual(errors, []);
await browser.close();
console.log("Screenshots saved; UI checks passed");
