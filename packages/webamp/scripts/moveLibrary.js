// mkdir built; cp dist/webamp-browser-min/webampBrowser.js built/webamp.bundle.min.js && cp dist/webamp-lazy-browser-min/webampLazyBrowser.js built/webamp.lazy-bundle.min.js

// Script to replicate the location of build artifacts that existed in the old Webpack build.
const fs = require("fs");
const path = require("path");

const BUILD_DIR = "../built";
const DIST_DIR = "../dist";

const TARGETS = [
  {
    parcelPath: "webamp-browser/webampBrowser.js",
    webpackName: "webamp.bundle.js",
  },
  {
    parcelPath: "webamp-browser-min/webampBrowser.js",
    webpackName: "webamp.bundle.min.js",
  },
  {
    parcelPath: "webamp-lazy-browser/webampLazyBrowser.js",
    webpackName: "webamp.lazy-bundle.js",
  },
  {
    parcelPath: "webamp-lazy-browser-min/webampLazyBrowser.js",
    webpackName: "webamp.lazy-bundle.min.js",
  },
];

fs.mkdirSync(BUILD_DIR, { recursive: true });

console.log("Copying build artifacts to their old Webpack locations:");
for (const target of TARGETS) {
  const from = path.join(DIST_DIR, target.parcelPath);
  const to = path.join(BUILD_DIR, target.webpackName);
  fs.copyFileSync(path.join(__dirname, from), path.join(__dirname, to));
  console.log(`Copied "${from}" to "${to}".`);
  const fromMap = `${from}.map`;
  const toMap = `${to}.map`;
  console.log(`Copied "${fromMap}" to "${toMap}".`);
  fs.copyFileSync(path.join(__dirname, fromMap), path.join(__dirname, toMap));
}
