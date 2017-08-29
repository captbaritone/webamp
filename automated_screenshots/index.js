const fs = require("fs");
const puppeteer = require("puppeteer");
const Filehound = require("filehound");

const config = {
  equalizer: true,
  playlist: true,
  hideAbout: true,
  noMarquee: true,
  audioUrl: null,
  initialState: {
    media: {
      status: "PLAYING",
      kbps: 128,
      khz: 44,
      length: 5,
      timeElapsed: 1,
      channels: 2,
      name: "1. DJ Mike Llama - Llama Whippin' Intro"
    },
    display: {
      working: false
    }
  }
};

(async () => {
  const files = await Filehound.create()
    .ext("wsz")
    .paths("skins/")
    .find();

  const browser = await puppeteer.launch();

  for (const skin of files) {
    const screenshotFile = `screenshots/${skin.replace(/\//g, "-")}.png`;
    if (fs.existsSync(screenshotFile)) {
      console.log(screenshotFile, "exists already");
      continue;
    }
    const page = await browser.newPage();
    page.setViewport({ width: 275, height: 116 * 3 });
    page.on("console", (...args) => {
      console.log("PAGE LOG:", ...args);
    });
    config.skinUrl = `automated_screenshots/${skin}`;
    const url = `http://localhost:8080/#${JSON.stringify(config)}`;
    console.log({ url });
    await page["goto"](url);
    await page.waitForSelector("#loaded");

    console.log("Writing screenshot to", screenshotFile);
    await page.screenshot({ path: screenshotFile });
    await page.close();
    break;
  }
  browser.close();
})();
