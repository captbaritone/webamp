const defaultTracksState = {
  "0": {
    selected: false,
    title: "Llama Whipping Intro",
    artist: "DJ Mike Llama",
    duration: "5",
    url: ""
  },
  "1": {
    selected: false,
    title: "Rock Is Dead",
    artist: "Marilyn Manson",
    duration: "191", // 3:11
    url: ""
  },
  "2": {
    selected: true,
    title: "Spybreak! (Short One)",
    artist: "Propellerheads",
    duration: "240", // 4:00
    url: ""
  },
  "3": {
    selected: false,
    title: "Bad Blood",
    artist: "Ministry",
    duration: "300", // 5:00
    url: ""
  }
};

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
    playlist: {
      tracks: defaultTracksState,
      trackOrder: [0, 1, 2, 3],
      currentTrack: 0
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
    await page.goto(url);
    await page.waitForSelector("#main-window", { timeout: 2000 });

    console.log("Writing screenshot to", screenshotFile);
    await page.screenshot({ path: screenshotFile });
    await page.close();
  }
  browser.close();
})();
