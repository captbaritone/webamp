import JSZip from "jszip";
import UI_ROOT from "../UIRoot";
import SkinParser from "./SkinEngine_WAL";
import AudionFaceSkinParser from "./skinParser_face";
import ClassicSkinParser from "./skinParser_wsz";

async function _loadSkin_WAL(skinPath: string) {
  const response = await fetch(skinPath);
  const skinZipBlob = await response.blob();

  UI_ROOT.logMessage("Loading .wal archive...");
  const zip = await JSZip.loadAsync(skinZipBlob);
  UI_ROOT.setZip(zip);
  await _parseSkin_WAL(SkinParser);
}

async function _parseSkin_WAL(ASkinParser: typeof SkinParser) {
  UI_ROOT._div.classList.remove("classic");

  UI_ROOT.logMessage("Parsing XML and initializing images...");
  const parser = new ASkinParser(UI_ROOT);

  // This is always the same as the global singleton.
  const uiRoot = await parser.parse();

  uiRoot.loadTrueTypeFonts();

  const start = performance.now();
  uiRoot.enableDefaultGammaSet();
  const end = performance.now();
  console.log(`Loading initial gamma took: ${(end - start) / 1000}s`);

  UI_ROOT.logMessage("Rendering skin for the first time...");
  uiRoot.draw();
  uiRoot.init();

  UI_ROOT.logMessage("Initializing Maki...");
  for (const container of uiRoot.getContainers()) {
    container.init();
  }
  UI_ROOT.logMessage("");
}

async function _loadPath_WAL(skinPath: string) {
  //TODO: check if the path is valid modern skin
  UI_ROOT.setZip(null);
  UI_ROOT.setSkinDir(skinPath);

  UI_ROOT.logMessage("Loading skin folder...");
  await _parseSkin_WAL(SkinParser);
}

async function _loadSkin_WSZ(skinPath: string) {
  const response = await fetch(skinPath);
  const skinZipBlob = await response.blob();

  UI_ROOT.logMessage("Loading .wsz archive...");
  const zip = await JSZip.loadAsync(skinZipBlob);
  UI_ROOT.setZip(zip);
  await _parseSkin_WAL(ClassicSkinParser);
  UI_ROOT._div.classList.add("classic");
}

async function _loadSkin_AudionFace(skinPath: string) {
  const response = await fetch(skinPath);
  const skinZipBlob = await response.blob();

  UI_ROOT.logMessage("Loading .face archive...");
  const zip = await JSZip.loadAsync(skinZipBlob);
  UI_ROOT.setZip(zip);
  await _parseSkin_WAL(AudionFaceSkinParser);
}

function prepareXuiTags() {
  UI_ROOT.addXuitagGroupDefId(
    "wasabi:mainframe:nostatus",
    "wasabi.mainframe.nostatusbar"
  );
  UI_ROOT.addXuitagGroupDefId(
    "wasabi:medialibraryframe:nostatus",
    "wasabi.medialibraryframe.nostatusbar"
  );
  UI_ROOT.addXuitagGroupDefId(
    "wasabi:playlistframe:nostatus",
    "wasabi.playlistframe.nostatusbar"
  );
  UI_ROOT.addXuitagGroupDefId(
    "wasabi:standardframe:modal",
    "wasabi.standardframe.modal"
  );
  UI_ROOT.addXuitagGroupDefId(
    "wasabi:standardframe:nostatus",
    "wasabi.standardframe.nostatusbar"
  );
  UI_ROOT.addXuitagGroupDefId(
    "wasabi:standardframe:static",
    "wasabi.standardframe.static"
  );
  UI_ROOT.addXuitagGroupDefId(
    "wasabi:standardframe:status",
    "wasabi.standardframe.statusbar"
  );
  UI_ROOT.addXuitagGroupDefId(
    "wasabi:visframe:nostatus",
    "wasabi.visframe.nostatusbar"
  );
}

export async function loadSkin(container: HTMLElement, skinPath: string) {
  UI_ROOT.reset();
  // document.body.appendChild(UI_ROOT.getRootDiv());
  container.appendChild(UI_ROOT.getRootDiv());

  prepareXuiTags();

  if (skinPath.endsWith(".wal")) {
    await _loadSkin_WAL(skinPath);
    //
  } else if (skinPath.endsWith("/")) {
    await _loadPath_WAL(skinPath);
    //
  } else if (skinPath.endsWith(".wsz")) {
    await _loadSkin_WSZ(skinPath);
  } else if (skinPath.endsWith(".face")) {
    await _loadSkin_AudionFace(skinPath);
    //
  } else {
    //TODO: support .swz and localhost path/to/skin-name/
    UI_ROOT.logMessage("not supported file: " + skinPath);
  }
}
