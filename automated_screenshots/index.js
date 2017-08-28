const puppeteer = require("puppeteer");
const Filehound = require("filehound");

const config = {
  equalizer: true,
  playlist: true,
  hideAbout: true,
  noMarquee: true
};

(async () => {
  const files = await Filehound.create().ext("wsz").paths("skins/").find();

  const browser = await puppeteer.launch();

  for (const skin of files) {
    const page = await browser.newPage();
    page.setViewport({ width: 275, height: 116 * 3 });
    page.on("console", (...args) => {
      console.log("PAGE LOG:", ...args);
    });
    config.skinUrl = `automated_screenshots/${skin}`;
    const url = `http://localhost:8080/#${JSON.stringify(config)}`;
    await page["goto"](url);
    await page.waitForSelector("#loaded");

    const screenshotFile = `screenshots/${skin.replace(/\//g, "-")}.png`;
    console.log("Writing screenshot to", screenshotFile);
    await page.screenshot({ path: screenshotFile });
  }
  browser.close();
})();
