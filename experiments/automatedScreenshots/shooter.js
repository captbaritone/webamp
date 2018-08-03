const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const JSZip = require("jszip");
const imagemin = require("imagemin");
const imageminOptipng = require("imagemin-optipng");

function min(imgPath) {
  return imagemin([imgPath], path.dirname(imgPath), {
    use: [imageminOptipng()]
  });
}

class Shooter {
  constructor() {
    this._initialized = false;
  }

  async init() {
    this._browser = await puppeteer.launch();
    this._page = await this._browser.newPage();
    this._page.setViewport({ width: 275, height: 116 * 3 });
    this._page.on("console", (...args) => {
      console.log("PAGE LOG:", ...args);
    });
    const url = `http://localhost:8080/?screenshot=1`;
    await this._page.goto(url);
    await this._page.waitForSelector("#main-window", { timeout: 2000 });
    await this._page.evaluate(() => {
      // Needed to allow for transparent screenshots
      window.document.body.style.background = "none";
    });
    this._initialized = true;
  }

  _validateZip(u) {
    return new Promise((resolve, reject) => {
      try {
        fs.readFile(u, (err, buffer) => {
          JSZip.loadAsync(buffer).then(resolve, reject);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async _ensureInitialized() {
    if (!this._initialized) {
      await this.init();
    }
  }

  async takeScreenshot(skin, screenshotPath, { minify = false }) {
    await this._ensureInitialized();
    console.log("Going to try", screenshotPath);
    try {
      await this._validateZip(skin);
    } catch (e) {
      console.log("Error parsing", skin, e);
      return;
    }
    try {
      const handle = await this._page.$("#webamp-file-input");
      await handle.uploadFile(skin);
      await this._page.evaluate(() => {
        return window.__webamp.skinIsLoaded();
      });
      await this._page.screenshot({
        path: screenshotPath,
        omitBackground: true, // Make screenshot transparent
        // https://github.com/GoogleChrome/puppeteer/issues/703#issuecomment-366041479
        clip: { x: 0, y: 0, width: 275, height: 116 * 3 }
      });
      console.log("Wrote screenshot to", screenshotPath);
      if (minify) {
        min(screenshotPath);
      }
      console.log("Minified", screenshotPath);
    } catch (e) {
      console.error("Something went wrong, restarting browser", e);
      await this.init();
      throw e;
    }
  }

  dispose() {
    this._ensureInitialized();
    this._browser.close();
    this._initialized = false;
  }
}

module.exports = Shooter;
