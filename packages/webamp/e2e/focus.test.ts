import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.waitForFunction(
    () => window.__webamp?.skinIsLoaded().then(() => true),
    { timeout: 20_000 }
  );
});

/**
 * Click the page body outside all Webamp windows to trigger blur/unfocus.
 */
async function clickBackground(page: import("@playwright/test").Page) {
  // Click a point well below the Webamp windows (bottom-right corner of the viewport)
  await page.mouse.click(1, 1);
}

test.describe("Window focus", () => {
  test("focuses EQ window when clicking its title bar", async ({ page }) => {
    await page.click("#equalizer-window .equalizer-top.title-bar");
    await expect(page.locator("#equalizer-window.selected")).toBeAttached();
  });

  test("unfocuses EQ window when clicking the desktop background", async ({
    page,
  }) => {
    await page.click("#equalizer-window .equalizer-top.title-bar");
    await expect(page.locator("#equalizer-window.selected")).toBeAttached();

    await clickBackground(page);
    await expect(page.locator("#equalizer-window.selected")).not.toBeAttached();
  });

  test("transfers focus from main window to EQ window", async ({ page }) => {
    await page.click("#main-window #title-bar");
    await expect(page.locator("#main-window.selected")).toBeAttached();

    await page.click("#equalizer-window .equalizer-top.title-bar");
    await expect(page.locator("#equalizer-window.selected")).toBeAttached();
    await expect(page.locator("#main-window.selected")).not.toBeAttached();
  });

  test("focuses a window with a single click (no double-click needed)", async ({
    page,
  }) => {
    await clickBackground(page);
    await expect(page.locator("#equalizer-window.selected")).not.toBeAttached();

    await page.click("#equalizer-window .equalizer-top.title-bar");
    await expect(page.locator("#equalizer-window.selected")).toBeAttached();
  });
});
