/* global SENTRY_DSN */

import * as Sentry from "@sentry/browser";
import ReactDOM from "react-dom";
import createMiddleware from "redux-sentry-middleware";
import isButterchurnSupported from "butterchurn/lib/isSupported.min";
import { WINDOWS } from "../../js/constants";
import * as Selectors from "../../js/selectors";
import { loggerMiddleware } from "./eventLogger";

import WebampLazy from "../../js/webampLazy";
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
  SET_DUMMY_VIZ_DATA,
} from "../../js/actionTypes";

import { loadFilesFromReferences } from "../../js/actionCreators";
import { getButterchurnOptions } from "./butterchurnOptions";
import dropboxFilePicker from "./dropboxFilePicker";
import availableSkins from "./avaliableSkins";

import {
  skinUrl as configSkinUrl,
  initialTracks,
  initialState,
  disableMarquee,
} from "./config";
import DemoDesktop from "./DemoDesktop";
import enableMediaSession from "./mediaSession";
import screenshotInitialState from "./screenshotInitialState";

const DEFAULT_DOCUMENT_TITLE = document.title;

const NOISY_ACTION_TYPES = new Set([
  STEP_MARQUEE,
  UPDATE_TIME_ELAPSED,
  UPDATE_WINDOW_POSITIONS,
  SET_VOLUME,
  SET_BALANCE,
  SET_BAND_VALUE,
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

try {
  Sentry.init({
    dsn: SENTRY_DSN,
    /* global COMMITHASH */
    release: typeof COMMITHASH !== "undefined" ? COMMITHASH : "DEV",
  });
} catch (e) {
  // Archive.org tries to rewrite the DSN to point to a archive.org version
  // since it looks like a URL. When this happens, Sentry crashes.
  console.error(e);
}

const sentryMiddleware = createMiddleware(Sentry, {
  filterBreadcrumbActions,
  stateTransformer: Selectors.getDebugData,
});

async function main() {
  const about = document.getElementsByClassName("about")[0];
  if (screenshot) {
    about.style.visibility = "hidden";
  }
  if (!WebampLazy.browserIsSupported()) {
    document.getElementById("browser-compatibility").style.display = "block";
    document.getElementById("app").style.visibility = "hidden";
    return;
  }
  about.classList.add("loaded");

  let __butterchurnOptions = null;
  let __initialWindowLayout = null;
  if (isButterchurnSupported()) {
    const startWithMilkdropHidden =
      document.body.clientWidth < MIN_MILKDROP_WIDTH ||
      skinUrl != null ||
      screenshot;

    __butterchurnOptions = getButterchurnOptions(startWithMilkdropHidden);

    if (startWithMilkdropHidden) {
      __initialWindowLayout = {
        [WINDOWS.MAIN]: { position: { x: 0, y: 0 } },
        [WINDOWS.EQUALIZER]: { position: { x: 0, y: 116 } },
        [WINDOWS.PLAYLIST]: { position: { x: 0, y: 232 }, size: [0, 0] },
        [WINDOWS.MILKDROP]: { position: { x: 0, y: 348 }, size: [0, 0] },
      };
    } else {
      __initialWindowLayout = {
        [WINDOWS.MAIN]: { position: { x: 0, y: 0 } },
        [WINDOWS.EQUALIZER]: { position: { x: 0, y: 116 } },
        [WINDOWS.PLAYLIST]: { position: { x: 0, y: 232 }, size: [0, 4] },
        [WINDOWS.MILKDROP]: { position: { x: 275, y: 0 }, size: [7, 12] },
      };
    }

    document.getElementById("butterchurn-share").style.display = "flex";
  }

  const initialSkin = !skinUrl ? null : { url: skinUrl };

  const webamp = new WebampLazy({
    initialSkin,
    initialTracks: screenshot ? null : initialTracks,
    availableSkins,
    filePickers: [dropboxFilePicker],
    enableHotkeys: true,
    handleTrackDropEvent: (e) => {
      const trackJson = e.dataTransfer.getData("text/json");
      if (trackJson == null) {
        return null;
      }
      try {
        const track = JSON.parse(trackJson);
        return [track];
      } catch (err) {
        return null;
      }
    },
    requireJSZip: () =>
      import(/* webpackChunkName: "jszip" */ "jszip/dist/jszip"),
    requireMusicMetadata: () =>
      import(
        /* webpackChunkName: "music-metadata-browser" */ "music-metadata-browser/dist/index"
      ),
    __initialWindowLayout,
    __initialState: screenshot ? screenshotInitialState : initialState,
    __butterchurnOptions,
    __customMiddlewares: [sentryMiddleware, loggerMiddleware],
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
        120: 1.5625,
      },
    });
  }

  webamp.onTrackDidChange((track) => {
    document.title =
      track == null
        ? DEFAULT_DOCUMENT_TITLE
        : `${track.metaData.title} - ${track.metaData.artist} \u00B7 ${DEFAULT_DOCUMENT_TITLE}`;
  });

  enableMediaSession(webamp);

  // Expose a file input in the DOM for testing.
  const fileInput = document.createElement("input");
  fileInput.id = "webamp-file-input";
  fileInput.style.display = "none";
  fileInput.type = "file";
  fileInput.value = null;
  fileInput.addEventListener("change", (e) => {
    webamp.store.dispatch(loadFilesFromReferences(e.target.files));
  });
  document.body.appendChild(fileInput);

  // Expose webamp instance for debugging and integration tests.
  window.__webamp = webamp;

  await webamp.renderWhenReady(document.getElementById("app"));

  if (!screenshot) {
    ReactDOM.render(
      <DemoDesktop webamp={webamp} />,
      document.getElementById("demo-desktop")
    );
  }
}

main();
