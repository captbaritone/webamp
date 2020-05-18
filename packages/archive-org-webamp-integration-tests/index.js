const puppeteer = require("puppeteer");

// Handle a few different cases since specialized pages use specialized classes.
const webampButtonSelector =
  ".js-webamp-use_skin_for_audio_items, .webamp-link";

// Create our own log function so we can mute it if we want
function log(message) {
  console.log(message);
}

const TIMEOUT = 10000;

async function expectSelector(page, selector) {
  log(`Waiting for selector ${selector}...`);
  await page.waitForSelector(selector, { visible: true, timeout: TIMEOUT });
  log(`Found selector ✅`);
}

async function testPage({ url, name, firstTrackText }) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    log(`🏁 [${name}] ${url}`);
    await page.goto(url);
    await expectSelector(page, webampButtonSelector);
    log("Going to click the Webamp button");
    // For some reason `page.click` often fails with `Error: Node is either not
    // visible or not an HTMLElement` so we use `page.evaluate` instead.
    // https://stackoverflow.com/a/52336777
    // await page.click(webampButtonSelector, { timeout: TIMEOUT });
    await page.evaluate(() => {
      document
        .querySelector(".js-webamp-use_skin_for_audio_items, .webamp-link")
        .click();
    });
    await expectSelector(page, "#webamp #main-window");
    log("Looking for first track...");
    const firstTrack = await page.$(".track-cell.current");
    if (firstTrack == null) {
      throw new Error("Could not find first track");
    }
    log("Getting text of first track...");
    const actualFirstTrackText = await page.evaluate(
      (_) => _.textContent,
      firstTrack
    );

    if (!actualFirstTrackText.includes(firstTrackText)) {
      throw new Error(
        `Could not find track title '${firstTrackText}' in "${actualFirstTrackText}"`
      );
    }

    log("Clicking play...");
    await page.click("#webamp #main-window #play", { timeout: TIMEOUT });
    await expectSelector(page, "#webamp #main-window.play");
    log("✅ Success! Test passed.");
  } catch (e) {
    log(`🛑 Errored in [${name}]. Wrote screenshot to ./error.png`);
    await page.screenshot({ path: "error.png", fullPage: true });
    throw e;
  } finally {
    log("DONE");
    await browser.close();
  }
}

async function testPageAndRetry(options) {
  let retries = 5;
  while (retries--) {
    try {
      await testPage(options);
      return;
    } catch (e) {
      console.error(e);
      if (retries > 0) {
        console.warn(`Retrying... ${retries} retries left.`);
      }
    }
  }
  throw new Error("Failed to pass even after 5 retries");
}

async function main() {
  await testPageAndRetry({
    name: "Popular",
    url: "https://archive.org/details/gd73-06-10.sbd.hollister.174.sbeok.shnf",
    firstTrackText: "Grateful Dead - Morning Dew",
  });
  await testPageAndRetry({
    name: "Regular",
    url:
      "https://archive.org/details/78_mambo-no.-5_perez-prado-and-his-orchestra-d.-perez-prado_gbia0009774b",
    firstTrackText: "Mambo No. 5",
  });
  await testPageAndRetry({
    name: "Samples Only",
    url:
      "https://archive.org/details/lp_smokey-and-the-bandit-2-original-soundtrac_various-brenda-lee-burt-reynolds-don-willi",
    firstTrackText: "Texas Bound And Flyin",
  });
  await testPageAndRetry({
    name: "Stream Only",
    url: "https://archive.org/details/cd_a-sweeter-music_sarah-cahill",
    firstTrackText: "Be Kind to One Another",
  });
  await testPageAndRetry({
    name: "Another",
    url:
      "https://archive.org/details/78_house-of-the-rising-sun_josh-white-and-his-guitar_gbia0001628b",
    firstTrackText: "House Of The Rising Sun",
  });
}

(async function () {
  try {
    await main();
  } catch (e) {
    console.error(e);
    // Ensure process returns an error exit code so that other tools know the test failed.
    process.exit(1);
  }
})();
