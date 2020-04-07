const path = require("path");
const puppeteer = require("puppeteer");
const imagemin = require("imagemin");
const imageminOptipng = require("imagemin-optipng");

function min(imgPath) {
  return imagemin([imgPath], path.dirname(imgPath), {
    use: [imageminOptipng()],
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
      console.log("page log:", ...args);
    });
    this._page.on("error", (e) => {
      console.log(`Page error: ${e.toString()}`);
    });
    this._page.on("dialog", async (dialog) => {
      console.log(`Page dialog ${dialog.message()}`);
      await dialog.dismiss();
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

  async _ensureInitialized() {
    if (!this._initialized) {
      await this.init();
    }
  }

  async takeScreenshot(skin, screenshotPath, { minify = false }) {
    await this._ensureInitialized();
    console.log("Going to try", screenshotPath, skin);
    try {
      console.log("geting input");
      const handle = await this._page.$("#webamp-file-input");
      console.log("uploading skin");
      await handle.uploadFile(skin);
      console.log("waiting for skin to load...");
      await this._page.evaluate(() => {
        return window.__webamp.skinIsLoaded();
      });
      console.log("waiting for screenshot");
      await this._page.screenshot({
        path: screenshotPath,
        omitBackground: true, // Make screenshot transparent
        // https://github.com/GoogleChrome/puppeteer/issues/703#issuecomment-366041479
        clip: { x: 0, y: 0, width: 275, height: 116 * 3 },
      });
      console.log("Wrote screenshot to", screenshotPath);
      if (minify) {
        min(screenshotPath);
      }
      console.log("Minified", screenshotPath);
    } catch (e) {
      console.error("Something went wrong, restarting browser", e);
      await this.dispose();
      await this.init();
      throw e;
    }
  }

  async dispose() {
    this._ensureInitialized();
    await this._page.close();
    await this._browser.close();
    this._initialized = false;
  }
}

module.exports = Shooter;
