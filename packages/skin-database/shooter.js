const path = require("path");
const puppeteer = require("puppeteer");
const imagemin = require("imagemin");
const imageminOptipng = require("imagemin-optipng");
const Skins = require("./data/skins");
const { throwAfter } = require("./utils");

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
      await shooter.dispose();
    }
  }

  async init() {
    this._log("init()");
    this._log("Going to launch puppeteer");
    this._browser = await puppeteer.launch({
      args: ["--disable-dev-shm-usage"],
    });
    this._log("Opening new page");
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
    const url = `${this._url}/?screenshot=1`;
    this._log(`Goto url ${url}`);
    await this._page.goto(url);
    this._log(`Waiting for selector...  #main-window...`);
    await this._page.waitForSelector("#main-window", { timeout: 2000 });
    this._log(`Setting background to none`);
    await this._page.evaluate(() => {
      // Needed to allow for transparent screenshots
      window.document.body.style.background = "none";
    });
    this._initialized = true;
    this._log(`Initialization complete!`);
  }

  async _ensureInitialized() {
    if (!this._initialized) {
      await this.init();
    }
  }

  async takeScreenshot(
    skin,
    screenshotPath,
    { minify = false, timeout = 30000, md5 }
  ) {
    try {
      await Promise.race([
        this._takeScreenshot(skin, screenshotPath, { minify }),
        throwAfter(
          `Screenshot did not complete within ${timeout / 1000} seconds.`,
          timeout
        ),
      ]);
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
    this._log(`_takeScreenshot`);
    await this._ensureInitialized();
    try {
      this._log(`Getting handle...`);
      const handle = await this._page.$("#webamp-file-input");

      this._log("Goinng to try to screenshot");
      // eslint-disable-next-line no-async-promise-executor
      await new Promise(async (resolve, reject) => {
        try {
          const dialogHandler = (dialog) => {
            cleanup();
            reject(new Error(`Dialog message: ${dialog.message()}`));
          };

          const errorHandler = (e) => {
            cleanup();
            reject(`Page Error: ${e.toString()}`);
          };

          const cleanup = () => {
            this._page.off("dialog", dialogHandler);
            this._page.off("error", errorHandler);
          };

          this._page.on("dialog", dialogHandler);
          this._page.on("error", errorHandler);
          this._log(`Adding skin...`);
          await handle.uploadFile(skin);
          this._log("Wating for skin to load...");
          await this._page.evaluate(() => {
            return window.__webamp.skinIsLoaded();
          });
          this._log(`Taking screenshot. Path is: ${screenshotPath}`);
          await this._page.screenshot({
            path: screenshotPath,
            omitBackground: true, // Make screenshot transparent
            // https://github.com/GoogleChrome/puppeteer/issues/703#issuecomment-366041479
            clip: { x: 0, y: 0, width: 275, height: 116 * 3 },
          });
          this._log("Took screenshot");

          this._log("Cleaning up");
          cleanup();

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
      this._log(`Caught an error, cleaning up: ${e}`);
      await this.dispose();
      await this.init();
      throw e;
    }
  }

  async dispose() {
    this._log(`Cleaning up shooter...`);
    await this._ensureInitialized();
    this._log(`Removing page listeners`);
    this._page.removeAllListeners();
    this._log(`Closing page`);
    await this._page.close();
    this._log(`Removing browser listeners`);
    this._browser.removeAllListeners();
    this._log(`Closing browser`);
    await this._browser.close();

    this._log(`Nulling values`);
    this._page = null;
    this._browser = null;
    this._initialized = false;
  }
}
