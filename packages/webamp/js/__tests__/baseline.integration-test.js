/* global page */
const { toMatchImageSnapshot } = require("jest-image-snapshot");
const path = require("path");

expect.extend({ toMatchImageSnapshot });

const DOMAIN = "http://localhost:8080";
const snapshotOptions = {
  // There are some font rendering issues which prevent us from pushing this lower right now.
  // We could setup some tests which don't render text and set the threshold lower.
  // Ideally we can resolve the font rendering issue.
  failureThreshold: "0.00",
  failureThresholdType: "percent",
};

// Hack to ensure changing the hash causes a page reload
beforeEach(async () => page.goto(`http://example.com`));

test("should render the default skin", async () => {
  await page.goto(`${DOMAIN}/#{"disableMarquee":true}`);
  expect(await page.screenshot()).toMatchImageSnapshot(snapshotOptions);
});

test("can 'pose' for a screenshot", async () => {
  await page.goto(`${DOMAIN}/?screenshot=1`);
  expect(await page.screenshot()).toMatchImageSnapshot(snapshotOptions);
});

test("can load a skin via the query params", async () => {
  await page.goto(
    // If this test starts to fail, check that the cache-bust location of the skin has not changed.
    `${DOMAIN}/?skinUrl=/skins/MacOSXAqua1-5-88dbd4e043795c98625462a908a2d965.wsz#{"disableMarquee":true}`
  );
  await page.evaluate(() => window.__webamp.skinIsLoaded());
  expect(await page.screenshot()).toMatchImageSnapshot(snapshotOptions);
});

test("can set a background color via the query params", async () => {
  await page.goto(`${DOMAIN}/?bg=%23ff0000#{"disableMarquee":true}`);
  await page.evaluate(() => window.__webamp.skinIsLoaded());
  expect(await page.screenshot()).toMatchImageSnapshot(snapshotOptions);
});

// This seems to fail hard for some other reason. Disable for now.
test.skip("can set soundcloud playlist via the query params", async () => {
  // If this test starts to fail, it might be flakyiness coming from the SoundCloud API, or that Poolside FM has changed their playlist.
  await page.goto(`${DOMAIN}/?scPlaylist=1040356177#{"disableMarquee":true}`);
  await page.evaluate(() => window.__webamp.skinIsLoaded());
  expect(await page.screenshot()).toMatchImageSnapshot(snapshotOptions);
});

test("should render the Topaz skin", async () => {
  await page.goto(`${DOMAIN}/#{"disableMarquee":true}`);
  await expect(page).toUploadFile(
    "#webamp-file-input",
    path.join(__dirname, "../../demo/skins/TopazAmp1-2.wsz")
  );
  await page.evaluate(() => window.__webamp.skinIsLoaded());
  expect(await page.screenshot()).toMatchImageSnapshot(snapshotOptions);
});

test("should render a skin that defines transparent regions", async () => {
  await page.goto(`${DOMAIN}/#{"disableMarquee":true}`);
  await expect(page).toUploadFile(
    "#webamp-file-input",
    path.join(__dirname, "../../demo/skins/Green-Dimension-V2.wsz")
  );
  await page.evaluate(() => window.__webamp.skinIsLoaded());
  expect(await page.screenshot()).toMatchImageSnapshot(snapshotOptions);
});

test("should render a skin that has files that only differ by case: main.bmp and main.BMP", async () => {
  await page.goto(`${DOMAIN}/#{"disableMarquee":true}`);
  await expect(page).toUploadFile(
    "#webamp-file-input",
    path.join(__dirname, "../../demo/skins/My_Funny_Valentine.wsz")
  );
  await page.evaluate(() => window.__webamp.skinIsLoaded());
  expect(await page.screenshot()).toMatchImageSnapshot(snapshotOptions);
});

test("uses the volume spirtes as a fallback when balance spirtes are missing", async () => {
  await page.goto(`${DOMAIN}/#{"disableMarquee":true}`);
  await expect(page).toUploadFile(
    "#webamp-file-input",
    path.join(__dirname, "../../demo/skins/AmigaPPC-dark.wsz")
  );
  await page.evaluate(() => window.__webamp.skinIsLoaded());
  expect(await page.screenshot()).toMatchImageSnapshot(snapshotOptions);
});

test("pads empty space in the marquee with the space character", async () => {
  await page.goto(`${DOMAIN}/#{"disableMarquee":true}`);
  // This skin has noticeable light blue where it expects the marquee to always cover.
  await expect(page).toUploadFile(
    "#webamp-file-input",
    path.join(__dirname, "../../demo/skins/Sonic_Attitude.wsz")
  );
  await page.evaluate(() => window.__webamp.skinIsLoaded());
  await page.evaluate(() =>
    window.__webamp.store.dispatch({ type: "SET_FOCUS", input: "balance" })
  );
  expect(await page.screenshot()).toMatchImageSnapshot(snapshotOptions);
});

test("can render skins that have forward slash in filename", async () => {
  await page.goto(`${DOMAIN}/#{"disableMarquee":true}`);
  await expect(page).toUploadFile(
    "#webamp-file-input",
    path.join(__dirname, "../../demo/skins/rei_1.wsz")
  );
  await page.evaluate(() => window.__webamp.skinIsLoaded());
  expect(await page.screenshot()).toMatchImageSnapshot(snapshotOptions);
});

test("closing winamp shows the icon", async () => {
  await page.goto(`${DOMAIN}/#{"disableMarquee":true}`);
  await page.evaluate(() => window.__webamp.skinIsLoaded());
  await page.evaluate(() =>
    window.__webamp.store.dispatch({ type: "CLOSE_WINAMP" })
  );
  expect(await page.screenshot()).toMatchImageSnapshot(snapshotOptions);
});
