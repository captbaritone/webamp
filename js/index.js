/* global SENTRY_DSN */

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
import WebampLazy from "./webampLazy";
import enableMediaSession from "./mediaSession";
import {
  STEP_MARQUEE,
  UPDATE_TIME_ELAPSED,
  UPDATE_WINDOW_POSITIONS,
  SET_VOLUME,
  SET_BALANCE,
  SET_BAND_VALUE,
  DISABLE_MARQUEE,
  TOGGLE_REPEAT,
  TOGGLE_SHUFFLE,
  SET_EQ_AUTO,
  SET_DUMMY_VIZ_DATA
} from "./actionTypes";
import { loadFilesFromReferences } from "./actionCreators";

import {
  skinUrl as configSkinUrl,
  initialTracks,
  initialState,
  disableMarquee
} from "./config";

import { bindToIndexDB } from "./indexdb";

const requireJSZip = () => {
  return new Promise((resolve, reject) => {
    require.ensure(
      ["jszip/dist/jszip"],
      require => {
        resolve(require("jszip/dist/jszip"));
      },
      e => {
        console.error("Error loading JSZip", e);
        reject(e);
      },
      "jszip"
    );
  });
};

const requireJSMediaTags = () => {
  return new Promise((resolve, reject) => {
    require.ensure(
      ["jsmediatags/dist/jsmediatags"],
      require => {
        resolve(require("jsmediatags/dist/jsmediatags"));
      },
      e => {
        console.error("Error loading jsmediatags", e);
        reject(e);
      },
      "jsmediatags"
    );
  });
};

const DEFAULT_DOCUMENT_TITLE = document.title;

const NOISY_ACTION_TYPES = new Set([
  STEP_MARQUEE,
  UPDATE_TIME_ELAPSED,
  UPDATE_WINDOW_POSITIONS,
  SET_VOLUME,
  SET_BALANCE,
  SET_BAND_VALUE
]);

const MIN_MILKDROP_WIDTH = 725;

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

Raven.context(async () => {
  window.Raven = Raven;
  if (screenshot) {
    document.getElementsByClassName("about")[0].style.visibility = "hidden";
  }
  if (!WebampLazy.browserIsSupported()) {
    document.getElementById("browser-compatibility").style.display = "block";
    document.getElementById("app").style.visibility = "hidden";
    return;
  }
  const __extraWindows = [];
  let __initialWindowLayout = {};

  if (isButterchurnSupported()) {
    const startWithMilkdropHidden =
      document.body.clientWidth < MIN_MILKDROP_WIDTH ||
      skinUrl != null ||
      screenshot;

    __extraWindows.push({
      id: "milkdrop",
      title: "Milkdrop",
      isVisualizer: true,
      Component: MilkdropWindow,
      open: !startWithMilkdropHidden
    });

    if (startWithMilkdropHidden) {
      __initialWindowLayout = {
        main: { position: { x: 0, y: 0 } },
        equalizer: { position: { x: 0, y: 116 } },
        playlist: { position: { x: 0, y: 232 }, size: [0, 0] },
        milkdrop: { position: { x: 0, y: 348 }, size: [0, 0] }
      };
    } else {
      __initialWindowLayout = {
        main: { position: { x: 0, y: 0 } },
        equalizer: { position: { x: 0, y: 116 } },
        playlist: { position: { x: 0, y: 232 }, size: [0, 4] },
        milkdrop: { position: { x: 275, y: 0 }, size: [7, 12] }
      };
    }

    document.getElementById("butterchurn-share").style.display = "flex";
  }

  const initialSkin = !skinUrl ? null : { url: skinUrl };

  const webamp = new WebampLazy({
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
    requireJSZip,
    requireJSMediaTags,
    __extraWindows,
    __initialWindowLayout,
    __initialState: screenshot ? screenshotInitialState : initialState,
    __customMiddlewares: [ravenMiddleware]
  });

  if (disableMarquee || screenshot) {
    webamp.store.dispatch({ type: DISABLE_MARQUEE });
  }
  if (screenshot) {
    window.document.body.style.backgroundColor = "#000";
    webamp.store.dispatch({ type: TOGGLE_REPEAT });
    webamp.store.dispatch({ type: TOGGLE_SHUFFLE });
    webamp.store.dispatch({ type: SET_EQ_AUTO, value: true });
    webamp.store.dispatch({
      type: SET_DUMMY_VIZ_DATA,
      data: {
        0: 11.75,
        8: 11.0625,
        16: 8.5,
        24: 7.3125,
        32: 6.75,
        40: 6.4375,
        48: 6.25,
        56: 5.875,
        64: 5.625,
        72: 5.25,
        80: 5.125,
        88: 4.875,
        96: 4.8125,
        104: 4.375,
        112: 3.625,
        120: 1.5625
      }
    });
  }

  webamp.onWillClose(cancel => {
    if (!window.confirm("Are you sure you want to close Webamp?")) {
      cancel();
    }
  });

  webamp.onTrackDidChange(track => {
    document.title =
      track == null
        ? DEFAULT_DOCUMENT_TITLE
        : `${track.metaData.title} - ${track.metaData.artist}`;
  });

  enableMediaSession(webamp);

  const fileInput = document.createElement("input");
  fileInput.id = "webamp-file-input";
  fileInput.style.display = "none";
  fileInput.type = "file";
  fileInput.value = null;
  fileInput.addEventListener("change", e => {
    webamp.store.dispatch(loadFilesFromReferences(e.target.files));
  });
  document.body.appendChild(fileInput);

  // Expose webamp instance for debugging and integration tests.
  window.__webamp = webamp;

  await bindToIndexDB(webamp);

  await webamp.renderWhenReady(document.getElementById("app"));
});
