import * as Sentry from "@sentry/browser";
// @ts-ignore
import createMiddleware from "redux-sentry-middleware";
// @ts-ignore
import isButterchurnSupported from "butterchurn/dist/isSupported.min";
import { loggerMiddleware } from "./eventLogger";
import * as SoundCloud from "./SoundCloud";

import {
  Action,
  Options,
  PrivateOptions,
  WINDOWS,
  STEP_MARQUEE,
  UPDATE_TIME_ELAPSED,
  UPDATE_WINDOW_POSITIONS,
  SET_VOLUME,
  SET_BALANCE,
  SET_BAND_VALUE,
  AppState,
  WindowLayout,
} from "./Webamp";

import { getButterchurnOptions } from "./butterchurnOptions";
import dropboxFilePicker from "./dropboxFilePicker";
import availableSkins from "./availableSkins";

import { initialTracks, initialState } from "./config";
import screenshotInitialState from "./screenshotInitialState";

const NOISY_ACTION_TYPES = new Set([
  STEP_MARQUEE,
  UPDATE_TIME_ELAPSED,
  UPDATE_WINDOW_POSITIONS,
  SET_VOLUME,
  SET_BALANCE,
  SET_BAND_VALUE,
]);

const MIN_MILKDROP_WIDTH = 725;

let lastActionType: string | null = null;

// Filter out consecutive common actions
function filterBreadcrumbActions(action: Action) {
  const noisy =
    lastActionType != null &&
    NOISY_ACTION_TYPES.has(action.type) &&
    NOISY_ACTION_TYPES.has(lastActionType);
  lastActionType = action.type;
  return !noisy;
}

const sentryMiddleware = createMiddleware(Sentry, {
  filterBreadcrumbActions,
  stateTransformer: getDebugData,
});

export async function getWebampConfig(
  screenshot: boolean,
  skinUrl: string | null,
  soundCloudPlaylist: SoundCloud.SoundCloudPlaylist | null
): Promise<Options & PrivateOptions> {
  let __butterchurnOptions;
  let windowLayout: WindowLayout | undefined;
  if (isButterchurnSupported()) {
    const startWithMilkdropHidden = skinUrl != null || screenshot;

    __butterchurnOptions = getButterchurnOptions(startWithMilkdropHidden);

    if (
      startWithMilkdropHidden ||
      document.body.clientWidth < MIN_MILKDROP_WIDTH
    ) {
      windowLayout = {
        main: { position: { left: 0, top: 0 } },
        equalizer: { position: { left: 0, top: 116 } },
        playlist: {
          position: { left: 0, top: 232 },
          size: { extraHeight: 0, extraWidth: 0 },
        },
        milkdrop: {
          position: { left: 0, top: 348 },
          size: { extraHeight: 0, extraWidth: 0 },
        },
      };
    } else {
      windowLayout = {
        main: { position: { left: 0, top: 0 } },
        equalizer: { position: { left: 0, top: 116 } },
        playlist: {
          position: { left: 0, top: 232 },
          size: { extraHeight: 4, extraWidth: 0 },
        },
        milkdrop: {
          position: { left: 275, top: 0 },
          size: { extraHeight: 12, extraWidth: 7 },
        },
      };
    }
  }

  const initialSkin = !skinUrl ? undefined : { url: skinUrl };

  return {
    initialSkin,
    // eslint-disable-next-line no-nested-ternary
    initialTracks: screenshot
      ? undefined
      : soundCloudPlaylist != null
      ? SoundCloud.tracksFromPlaylist(soundCloudPlaylist)
      : initialTracks,
    availableSkins,
    windowLayout,
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
      // @ts-ignore
      import(/* webpackChunkName: "jszip" */ "jszip/dist/jszip"),
    requireMusicMetadata: () =>
      import(
        /* webpackChunkName: "music-metadata-browser" */ "music-metadata-browser/dist/index"
      ),
    __initialState: screenshot ? screenshotInitialState : initialState,
    __butterchurnOptions,
    __customMiddlewares: [sentryMiddleware, loggerMiddleware],
  };
}

function getDebugData(state: AppState) {
  return {
    ...state,
    display: {
      ...state.display,
      skinGenLetterWidths: "[[REDACTED]]",
      skinImages: "[[REDACTED]]",
      skinCursors: "[[REDACTED]]",
      skinRegion: "[[REDACTED]]",
    },
  };
}
