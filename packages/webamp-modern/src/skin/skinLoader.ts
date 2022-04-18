import JSZip from "jszip";
import UI_ROOT from "../UIRoot";
import SkinParser from "./parse";

const STATUS = document.getElementById("status");

function setStatus(status: string) {
  STATUS.innerText = status;
}

async function _loadSkin_WAL(skinPath: string) {
  const response = await fetch(skinPath);
  const skinZipBlob = await response.blob();

  setStatus("Loading .wal archive...");
  const zip = await JSZip.loadAsync(skinZipBlob);
  UI_ROOT.setZip(zip);
  await _parseSkin_WAL();
}

async function _parseSkin_WAL() {
  setStatus("Parsing XML and initializing images...");
  const parser = new SkinParser(UI_ROOT);

  // This is always the same as the global singleton.
  const uiRoot = await parser.parse();

  uiRoot.loadTrueTypeFonts();

  const start = performance.now();
  uiRoot.enableDefaultGammaSet();
  const end = performance.now();
  console.log(`Loading initial gamma took: ${(end - start) / 1000}s`);

  setStatus("Rendering skin for the first time...");
  uiRoot.draw();
  uiRoot.init();

  setStatus("Initializing Maki...");
  for (const container of uiRoot.getContainers()) {
    container.init();
  }
  setStatus("");
}

async function _loadPath_WAL(skinPath: string) {
  //TODO: check if the path is valid modern skin
  UI_ROOT.setZip(null);
  UI_ROOT.setSkinDir(skinPath);

  setStatus("Loading skin folder...");
  await _parseSkin_WAL();
}

export async function loadSkin(skinPath: string) {
  UI_ROOT.reset();
  document.body.appendChild(UI_ROOT.getRootDiv());

  if (skinPath.endsWith(".wal")) {
    await _loadSkin_WAL(skinPath);
    //
  } else if (skinPath.endsWith("/")) {
    await _loadPath_WAL(skinPath);
    //
  } else if (skinPath.endsWith(".swz")) {
    //TODO: support .swz classic skin
    setStatus("not supported file: " + skinPath);
    //
  } else {
    //TODO: support .swz and localhost path/to/skin-name/
    setStatus("not supported file: " + skinPath);
  }
}
