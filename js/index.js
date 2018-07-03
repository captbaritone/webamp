/* global SENTRY_DSN */

import "babel-polyfill";
import Raven from "raven-js";
import createMiddleware from "raven-for-redux";
import isButterchurnSupported from "butterchurn/lib/isSupported.min";
import base from "../skins/base-2.91-png.wsz";
import osx from "../skins/MacOSXAqua1-5.wsz";
import topaz from "../skins/TopazAmp1-2.wsz";
import visor from "../skins/Vizor1-01.wsz";
import xmms from "../skins/XMMS-Turquoise.wsz";
import zaxon from "../skins/ZaxonRemake1-0.wsz";
import green from "../skins/Green-Dimension-V2.wsz";
import MilkdropWindow from "./components/MilkdropWindow";
import screenshotInitialState from "./screenshotInitialState";
import Webamp from "./webamp";
import {
  STEP_MARQUEE,
  UPDATE_TIME_ELAPSED,
  UPDATE_WINDOW_POSITIONS,
  SET_VOLUME,
  SET_BALANCE,
  SET_BAND_VALUE
} from "./actionTypes";

import {
  skinUrl as configSkinUrl,
  initialTracks,
  initialState,
  milkdrop,
  disableMarquee
} from "./config";

const NOISY_ACTION_TYPES = new Set([
  STEP_MARQUEE,
  UPDATE_TIME_ELAPSED,
  UPDATE_WINDOW_POSITIONS,
  SET_VOLUME,
  SET_BALANCE,
  SET_BAND_VALUE
]);

let screenshot = false;
let skinUrl = configSkinUrl;
if ("URLSearchParams" in window) {
  const params = new URLSearchParams(location.search);
  screenshot = params.get("screenshot");
  skinUrl = params.get("skinUrl") || skinUrl;
}

function supressDragAndDrop(e) {
  e.preventDefault();
  e.dataTransfer.effectAllowed = "none";
  e.dataTransfer.dropEffect = "none";
}

window.addEventListener("dragenter", supressDragAndDrop);
window.addEventListener("dragover", supressDragAndDrop);
window.addEventListener("drop", supressDragAndDrop);

let lastActionType = null;

// Filter out consecutive common actions
function filterBreadcrumbActions(action) {
  const noisy =
    NOISY_ACTION_TYPES.has(action.type) &&
    NOISY_ACTION_TYPES.has(lastActionType);
  lastActionType = action.type;
  return !noisy;
}

Raven.config(SENTRY_DSN, {
  /* global COMMITHASH */
  release: typeof COMMITHASH !== "undefined" ? COMMITHASH : "DEV"
}).install();

const ravenMiddleware = createMiddleware(Raven, {
  filterBreadcrumbActions,
  stateTransformer: state => ({
    ...state,
    display: {
      ...state.display,
      skinGenLetterWidths: "[[REDACTED]]",
      skinImages: "[[REDACTED]]",
      skinCursors: "[[REDACTED]]",
      skinRegion: "[[REDACTED]]"
    }
  })
});

// Don't prompt user to install Webamp. It's probably not
// what they want.
window.addEventListener("beforeinstallprompt", e => {
  // TODO: we could add this as a context menu item, or something.
  e.preventDefault();
});

// Requires Dropbox's Chooser to be loaded on the page
function genAudioFileUrlsFromDropbox() {
  return new Promise((resolve, reject) => {
    if (window.Dropbox == null) {
      reject();
    }
    window.Dropbox.choose({
      success: resolve,
      error: reject,
      linkType: "direct",
      folderselect: false,
      multiselect: true,
      extensions: ["video", "audio"]
    });
  });
}

Raven.context(() => {
  if (screenshot) {
    document.getElementsByClassName("about")[0].style.visibility = "hidden";
  }
  if (!Webamp.browserIsSupported()) {
    document.getElementById("browser-compatibility").style.display = "block";
    document.getElementById("app").style.visibility = "hidden";
    return;
  }
  const __extraWindows = [];
  let __initialWindowLayout = {};
  if (milkdrop && isButterchurnSupported()) {
    __extraWindows.push({
      id: "milkdrop",
      title: "Milkdrop",
      isVisualizer: true,
      Component: MilkdropWindow
    });
    // TODO: Pick a layout dependent upon the window size.
    __initialWindowLayout = {
      main: { position: { x: 0, y: 0 } },
      equalizer: { position: { x: 0, y: 116 } },
      playlist: { position: { x: 0, y: 232 }, size: [0, 4] },
      milkdrop: { position: { x: 275, y: 0 }, size: [7, 12] }
    };

    document.getElementById("butterchurn-share").style.display = "flex";
  }

  const initialSkin = !skinUrl ? null : { url: skinUrl };

  const webamp = new Webamp({
    initialSkin,
    initialTracks: screenshot ? null : initialTracks,
    availableSkins: [
      { url: base, name: "<Base Skin>" },
      { url: green, name: "Green Dimension V2" },
      { url: osx, name: "Mac OSX v1.5 (Aqua)" },
      { url: topaz, name: "TopazAmp" },
      { url: visor, name: "Vizor" },
      { url: xmms, name: "XMMS Turquoise " },
      { url: zaxon, name: "Zaxon Remake" }
    ],
    filePickers: [
      {
        contextMenuName: "Dropbox...",
        filePicker: async () => {
          const files = await genAudioFileUrlsFromDropbox();
          return files.map(file => ({
            url: file.link,
            defaultName: file.name
          }));
        },
        requiresNetwork: true
      }
    ],
    enableHotkeys: true,
    __disableMarquee: disableMarquee || screenshot,
    __extraWindows,
    __initialWindowLayout,
    __initialState: screenshot ? screenshotInitialState : initialState,
    __customMiddlewares: [ravenMiddleware]
  });

  webamp.renderWhenReady(document.getElementById("app"));

  // Expose webamp instance for debugging and integration tests.
  window.__webamp = webamp;
});
