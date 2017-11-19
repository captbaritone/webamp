/*
This dummy data has been removed from the actual app. I'll put it here in
case we want to continue to use it for screenshots

const defaultTracksState = {
  "0": {
    selected: false,
    title: "Llama Whipping Intro",
    artist: "DJ Mike Llama",
    duration: "221"
  },
  "1": {
    selected: false,
    title: "Rock Is Dead",
    artist: "Marilyn Manson",
    duration: "221"
  },
  "2": {
    selected: true,
    title: "Spybreak! (Short One)",
    artist: "Propellerheads",
    duration: "171"
  },
  "3": {
    selected: false,
    title: "Clubbed to Death",
    artist: "Rob D",
    duration: "215"
  },
  "4": {
    selected: false,
    title: "Leave You Far Behind",
    artist: "Lunatic Calm",
    duration: "174"
  },
  "5": {
    selected: false,
    title: "Dragula",
    artist: "Rob Zombie",
    duration: "484"
  },
  "6": {
    selected: false,
    title: "Ultrasonic Sound",
    artist: "Hive",
    duration: "152"
  },
  "7": {
    selected: false,
    title: "Du hast",
    artist: "Rammstein",
    duration: "214"
  }
};
*/

const fs = require("fs");
const puppeteer = require("puppeteer");
const Filehound = require("filehound");
const JSZip = require("jszip");
const md5File = require("md5-file");

const validateZip = u =>
  new Promise((resolve, reject) => {
    fs.readFile(u, (err, buffer) => {
      JSZip.loadAsync(buffer).then(resolve, reject);
    });
  });

const config = {
  playlist: true,
  hideAbout: true,
  noMarquee: true,
  audioUrl: null,
  initialState: {
    equalizer: {
      sliders: {
        "60": 52,
        "170": 74,
        "310": 83,
        "600": 91,
        "1000": 74,
        "3000": 54,
        "6000": 23,
        "12000": 19,
        "14000": 34,
        "16000": 75,
        preamp: 56
      }
    },
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
    const skinMd5 = md5File.sync(skin);
    const screenshotFile = `screenshots/${skin.replace(
      /\//g,
      "-"
    )}-${skinMd5}.png`;
    const skinUrl = `experiments/automatedScreenshots/${skin}`;
    console.log("Going to try", screenshotFile);
    try {
      await validateZip(`./${skin}`);
    } catch (e) {
      console.log("Error parsing", skinUrl, e);
      continue;
    }
    if (fs.existsSync(screenshotFile)) {
      console.log(screenshotFile, "exists already");
      continue;
    }
    const page = await browser.newPage();
    page.setViewport({ width: 275, height: 116 * 3 });
    page.on("console", (...args) => {
      console.log("PAGE LOG:", ...args);
    });
    config.skinUrl = skinUrl;
    const url = `http://localhost:8080/#${JSON.stringify(config)}`;
    console.log({ url });
    await page["goto"](url);
    await page.waitForSelector("#loaded", { timeout: 2000 });

    console.log("Writing screenshot to", screenshotFile);
    await page.screenshot({ path: screenshotFile });
    await page.close();
  }
  browser.close();
})();
