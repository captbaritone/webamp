import JSZip from "jszip";
// This module is imported early here in order to avoid a circular dependency.
import { classResolver } from "./skin/resolver";
import SkinParser from "./skin/parse";
import UI_ROOT from "./UIRoot";
import { removeAllChildNodes } from "./utils";
import { addDropHandler } from "./dropTarget";

function hack() {
  // Without this Snowpack will try to treeshake out resolver causing a circular
  // dependency.
  classResolver("A funny joke about why this is needed.");
}

addDropHandler(loadSkin);

const STATUS = document.getElementById("status");

function setStatus(status: string) {
  STATUS.innerText = status;
}

async function main() {
  setStatus("Downloading skin...");
  // const response = await fetch("assets/CornerAmp_Redux.wal");
  // const response = await fetch("assets/Default_winamp3_build499.wal");
  const response = await fetch("assets/MMD3.wal");
  const data = await response.blob();
  await loadSkin(data);
}

async function loadSkin(skinData: Blob) {
  UI_ROOT.reset();
  document.body.appendChild(UI_ROOT.getRootDiv());

  setStatus("Loading .wal archive...");
  const zip = await JSZip.loadAsync(skinData);

  setStatus("Parsing XML and initializing images...");
  const parser = new SkinParser(zip, UI_ROOT);

  // This is always the same as the global singleton.
  const uiRoot = await parser.parse();

  setStatus("Enabling Colors...");
  uiRoot.enableDefaultGammaSet();

  setStatus("Rendering skin for the first time...");
  uiRoot.draw();

  setStatus("Initializing Maki...");
  for (const container of uiRoot.getContainers()) {
    container.init();
  }
  setStatus("");
}

main();
