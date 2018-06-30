const { toMatchImageSnapshot } = require("jest-image-snapshot");

expect.extend({ toMatchImageSnapshot });

// Hack to ensure changing the hash causes a page reload
beforeEach(async () => page.goto(`http://example.com`));

it("should render the default skin", async () => {
  await page.goto(`http://localhost:8080/#{"disableMarquee":true}`);
  expect(await page.screenshot()).toMatchImageSnapshot();
});

it("can 'pose' for a screenshot", async () => {
  await page.goto(
    `http://localhost:8080/?screenshot=1#{"disableMarquee":true}`
  );
  expect(await page.screenshot()).toMatchImageSnapshot();
});

it("should render the Topaz skin", async () => {
  await page.goto(`http://localhost:8080/#{"disableMarquee":true}`);
  expect(page).toUploadFile("#webamp-file-input", "./skins/TopazAmp1-2.wsz");
  await new Promise(resolve => setTimeout(resolve, 200));
  expect(await page.screenshot()).toMatchImageSnapshot();
});

it("should render a skin that defines transparent regions", async () => {
  await page.goto(`http://localhost:8080/#{"disableMarquee":true}`);
  expect(page).toUploadFile(
    "#webamp-file-input",
    "./skins/Green-Dimension-V2.wsz"
  );
  await new Promise(resolve => setTimeout(resolve, 200));
  expect(await page.screenshot()).toMatchImageSnapshot();
});

it("uses the volume spirtes as a fallback when balance spirtes are missing", async () => {
  await page.goto(`http://localhost:8080/#{"disableMarquee":true}`);
  expect(page).toUploadFile("#webamp-file-input", "./skins/AmigaPPC-dark.wsz");
  await new Promise(resolve => setTimeout(resolve, 200));
  expect(await page.screenshot()).toMatchImageSnapshot();
});
