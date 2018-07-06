const { toMatchImageSnapshot } = require("jest-image-snapshot");

expect.extend({ toMatchImageSnapshot });

// Hack to ensure changing the hash causes a page reload
beforeEach(async () => page.goto(`http://example.com`));

test("should render the default skin", async () => {
  await page.goto(`http://localhost:8080/#{"disableMarquee":true}`);
  expect(await page.screenshot()).toMatchImageSnapshot();
});

test("can 'pose' for a screenshot", async () => {
  await page.goto(`http://localhost:8080/?screenshot=1`);
  expect(await page.screenshot()).toMatchImageSnapshot();
});

test("can load a skin via the query params", async () => {
  await page.goto(
    // If this test starts to fail, check that the cache-bust location of the skin has not changed.
    `http://localhost:8080/?skinUrl=skins/MacOSXAqua1-5-88dbd4e043795c98625462a908a2d965.wsz#{"disableMarquee":true}`
  );
  expect(await page.screenshot()).toMatchImageSnapshot();
});

test("should render the Topaz skin", async () => {
  await page.goto(`http://localhost:8080/#{"disableMarquee":true}`);
  expect(page).toUploadFile("#webamp-file-input", "./skins/TopazAmp1-2.wsz");
  await new Promise(resolve => setTimeout(resolve, 200));
  expect(await page.screenshot()).toMatchImageSnapshot();
});

test("should render a skin that defines transparent regions", async () => {
  await page.goto(`http://localhost:8080/#{"disableMarquee":true}`);
  expect(page).toUploadFile(
    "#webamp-file-input",
    "./skins/Green-Dimension-V2.wsz"
  );
  await new Promise(resolve => setTimeout(resolve, 200));
  expect(await page.screenshot()).toMatchImageSnapshot();
});

test("uses the volume spirtes as a fallback when balance spirtes are missing", async () => {
  await page.goto(`http://localhost:8080/#{"disableMarquee":true}`);
  expect(page).toUploadFile("#webamp-file-input", "./skins/AmigaPPC-dark.wsz");
  await new Promise(resolve => setTimeout(resolve, 200));
  expect(await page.screenshot()).toMatchImageSnapshot();
});

test("pads empty space in the marquee with the space character", async () => {
  await page.goto(`http://localhost:8080/#{"disableMarquee":true}`);
  // This skin has noticeable light blue where it expects the marquee to always cover.
  expect(page).toUploadFile("#webamp-file-input", "./skins/Sonic_Attitude.wsz");
  await new Promise(resolve => setTimeout(resolve, 200));
  await page.evaluate(() =>
    window.__webamp.store.dispatch({ type: "SET_FOCUS", input: "balance" })
  );
  expect(await page.screenshot()).toMatchImageSnapshot();
});
