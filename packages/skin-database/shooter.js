/* global window */
const path = require("path");
const puppeteer = require("puppeteer");
const imagemin = require("imagemin");
const imageminOptipng = require("imagemin-optipng");
const Skins = require("./data/skins");

function min(imgPath) {
  return imagemin([imgPath], path.dirname(imgPath), {
    use: [imageminOptipng()],
  });
}

export default class Shooter {
  constructor(url, logger) {
    this._initialized = false;
    this._url = url;
    this._log = logger ?? ((str) => console.log(str));
  }

  static async withShooter(cb, logger) {
    const shooter = new Shooter("https://webamp.org", logger);
    try {
      return await cb(shooter);
    } finally {
      shooter.dispose();
    }
  }

  async init() {
    this._browser = await puppeteer.launch();
    this._page = await this._browser.newPage();
    this._page.setViewport({ width: 275, height: 116 * 3 });
    this._page.on("console", (consoleMessage) => {
      if (
        consoleMessage.text() ===
        "The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page. https://goo.gl/7K7WLu"
      ) {
        return;
      }

      this._log("page log:", consoleMessage.text());
    });
    this._page.on("error", (e) => {
      this._log(`Page error: ${e.toString()}`);
    });

    const url = `${this._url}/?screenshot=1`;
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

  async takeScreenshot(skin, screenshotPath, { minify = false, md5 }) {
    try {
      await this._takeScreenshot(skin, screenshotPath, { minify });
    } catch (e) {
      await Skins.recordScreenshotUpdate(
        md5,
        e.message || String(e) || "Unkown error"
      );
      return false;
    }
    await Skins.recordScreenshotUpdate(md5);
    return true;
  }

  async _takeScreenshot(skin, screenshotPath, { minify = false }) {
    await this._ensureInitialized();
    try {
      const handle = await this._page.$("#webamp-file-input");

      this._log("Goinng to try to screenshot");
      // eslint-disable-next-line no-async-promise-executor
      await new Promise(async (resolve, reject) => {
        try {
          const dialogHandler = (dialog) => {
            reject(new Error(`Dialog message: ${dialog.message()}`));
          };
          await handle.uploadFile(skin);
          await this._page.evaluate(() => {
            return window.__webamp.skinIsLoaded();
          });
          await this._page.screenshot({
            path: screenshotPath,
            omitBackground: true, // Make screenshot transparent
            // https://github.com/GoogleChrome/puppeteer/issues/703#issuecomment-366041479
            clip: { x: 0, y: 0, width: 275, height: 116 * 3 },
          });

          this._page.off("dialog", dialogHandler);

          resolve();
        } catch (e) {
          reject(e);
        }
      });

      this._log("Wrote screenshot to", screenshotPath);
      if (minify) {
        min(screenshotPath);
      }
    } catch (e) {
      await this.dispose();
      await this.init();
      throw e;
    }
  }

  async dispose() {
    await this._ensureInitialized();
    await this._page.close();
    await this._browser.close();
    this._initialized = false;
  }
}
