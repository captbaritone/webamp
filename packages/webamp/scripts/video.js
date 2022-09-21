"use strict";

// https://github.com/clipisode/puppeteer-recorder/blob/master/index.js

const puppeteer = require("puppeteer");
const { spawn } = require("child_process");
// TODO: Should be fs-extra
const fs = require("fs");

console.log(process.argv);

// const GREEN_DIMENSIONS_HASH = "4308a2fc648033bf5fe7c4d56a5c8823";
const HASH = process.argv[2];
const WEBAMP_URL = `https://webamp.org/?skinUrl=https://cdn.webampskins.org/skins/${HASH}.wsz&screenshot=1`;

const FPS = 60;
const WIDTH = 275;
const HEIGHT = 116 * 3;
const SAVE_IMG = true;

// x1.5 => 1080p
// x3 => 4k
// x6 => 8k
const SCALE = 2;

const SCALE_MAP = {
  1: "hd",
  2: "retina",
  1.5: "fullhd",
  3: "4k",
  6: "8k",
};

const getRes = (scale = SCALE) => {
  return SCALE_MAP[scale];
};

const filename = () => {
  const res = getRes();
  if (!res) {
    throw Error(
      `Invalid scale, must be one of these: ${Object.keys(res).join()}`
    );
  }

  return `video-${res}.mov`;
};

if (SAVE_IMG) {
  fs.emptyDir(`./frames-${getRes()}`);
}

const args = [
  "-y",
  "-f",
  "image2pipe",
  "-r",
  `${FPS}`,
  "-i",
  "-",
  "-pix_fmt",
  "yuv420p",
  "-crf",
  "2",
  filename(),
];

const ffmpeg = spawn("ffmpeg", args);

const closed = new Promise((resolve, reject) => {
  ffmpeg.on("error", reject);
  ffmpeg.on("close", resolve);
});

ffmpeg.stdout.pipe(process.stdout);
ffmpeg.stderr.pipe(process.stderr);

const write = (stream, buffer) =>
  new Promise((resolve, reject) => {
    stream.write(buffer, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: SCALE,
  });

  await page.goto(WEBAMP_URL);
  //
  await page.evaluate(() => window.__webamp.skinIsLoaded());

  /*
  const frames = await page.evaluate(
    async (fps) => Math.ceil((window.timeline.duration() / 1) * fps),
    FPS
  );
  */
  const frames = 120;
  let frame = 0;

  // pause and reset
  await page.evaluate(() => {
    // window.timeline.pause();
    // window.timeline.progress(0);
  });

  const nextFrame = async () => {
    await page.evaluate(async (progress) => {
      window.__webamp.store.dispatch({
        type: "SET_BAND_VALUE",
        band: 14000,
        value: progress * 100,
      });
      window.__webamp.store.dispatch({
        type: "SET_VOLUME",
        volume: Math.round(progress * 100),
      });
      /*
      window.__webamp.store.dispatch({
        type: "SET_BALANCE",
        balance: Math.round(progress * 200 - 100),
      });
      */
      // await new Promise((r) => setTimeout(r, 16));
    }, frame / frames);

    const screenshot = await page.screenshot();
    await write(ffmpeg.stdin, screenshot);

    frame++;

    console.log(`frame ${frame} / ${frames}`);

    if (frame > frames) {
      console.log("done!");
      await browser.close();

      ffmpeg.stdin.end();
      await closed;
      return;
    }

    nextFrame();
  };

  nextFrame();
}

main();
