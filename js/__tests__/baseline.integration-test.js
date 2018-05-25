const { toMatchImageSnapshot } = require("jest-image-snapshot");

expect.extend({ toMatchImageSnapshot });

beforeAll(async () => {
  await page.goto(`http://localhost:8080/#{"disableMarquee":true}`);
});

it("should render the default skin", async () => {
  expect(await page.screenshot()).toMatchImageSnapshot();
});

it("should render the Topaz skin", async () => {
  expect(page).toUploadFile("#webamp-file-input", "./skins/TopazAmp1-2.wsz");
  await new Promise(resolve => setTimeout(resolve, 200));
  expect(await page.screenshot()).toMatchImageSnapshot();
});
