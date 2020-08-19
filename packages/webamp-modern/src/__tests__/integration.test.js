import path from "path";
import fs from "fs";
import JSZip from "jszip";
import { create } from "../store";
import * as Actions from "../Actions";
import * as Utils from "../utils";
import System from "../runtime/System";

test("sameObject", async () => {
  const messages = await runSkin("sameObject");

  expect(messages).toEqual([
    ["empty object equal each other", "Success", 0, ""],
    ["same object equal each other", "Success", 0, ""],
    ["different objects do not equal each other", "Success", 0, ""],
  ]);
});

test("simpleClick", async () => {
  const messages = await runSkin("simpleClick");

  expect(messages).toEqual([
    ["onScriptLoaded", "Success", 0, ""],
    ["play_button.onLeftClick", "Success", 0, ""],
  ]);
});

// Adapted from https://github.com/Stuk/jszip/issues/386#issuecomment-510802546
function buildZipFromDirectory(dir, zip, root) {
  const list = fs.readdirSync(dir);

  for (let file of list) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      buildZipFromDirectory(file, zip, root);
    } else {
      const filedata = fs.readFileSync(file);
      zip.file(path.relative(root, file), filedata);
    }
  }
}

// Returns a promise that resolves when the state of a Redux store matches the
// given predicate
function isInState(store, predicate) {
  return new Promise((resolve) => {
    const unsubscribe = store.subscribe(() => {
      if (predicate(store.getState())) {
        resolve();
        unsubscribe();
      }
    });
  });
}

// Given a skin directory in `resources/testSkins/` loads it and returns
// an array representing all the calls to System.messagebox.
async function runSkin(skinDirectory) {
  const skinDirectoryPath = path.join(
    __dirname,
    "../../resources/testSkins/",
    skinDirectory
  );
  const zip = new JSZip();
  buildZipFromDirectory(skinDirectoryPath, zip, skinDirectoryPath);

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  function fakeMessageBox(a, b, c, d) {
    // This function has four fake arguments because we check the arity of the
    // method in the VM to determine how many values to pop off the stack.
  }
  expect(fakeMessageBox.length).toBe(System.prototype.messagebox.length);

  const mockMessageBox = jest.fn(fakeMessageBox);
  System.prototype.messagebox = mockMessageBox;

  const store = create();
  store.dispatch(Actions.gotSkinZip(zip, store));
  await isInState(store, (state) => state.modernSkin.skinLoaded);

  return mockMessageBox.mock.calls;
}

// Mock out some utility functions which depend upon browser APIs which are not
// supported by JSDOM.

/* eslint-disable import/namespace */

Utils.getSizeFromUrl = jest.fn(() => {
  // TODO: Actually compute this. Perhaps with https://www.npmjs.com/package/image-size
  // It will likely require converting data URIs generted by getUrlFromBlob into a buffer.
  return { width: 0, height: 0 };
});
Utils.getUrlFromBlob = jest.fn((blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      resolve(e.target.result);
    };
    // TODO: Preserve the mimetype of these files
    reader.readAsDataURL(blob);
  });
});
