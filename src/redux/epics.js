import { combineEpics } from "redux-observable";
import { of, from, empty } from "rxjs";
import * as Actions from "./actionCreators";
import * as Selectors from "./selectors";
import * as Utils from "../utils";
import {
  filter,
  switchMap,
  map,
  ignoreElements,
  mergeMap,
  tap
} from "rxjs/operators";
import { search } from "../algolia";

const urlChangedEpic = actions =>
  actions.pipe(
    filter(action => action.type === "URL_CHANGED"),
    switchMap(action => {
      if (action.location.pathname === "/about/") {
        return of(Actions.requestedAboutPage());
      }
      const params = new URLSearchParams(action.location.search);
      const query = params != null && params.get("query");

      if (action.location.pathname.startsWith("/skin/")) {
        const segments = action.location.pathname.split("/");
        const actions = [Actions.selectedSkin(segments[2])];
        if (segments[3] === "files") {
          actions.push(Actions.selectSkinFile(segments[4]));
        }
        return of(...actions);
      }
      return of(Actions.searchQueryChanged(query || ""));
    })
  );

const selectedSkinEpic = actions =>
  actions.pipe(
    filter(action => action.type === "SELECTED_SKIN"),
    switchMap(action => {
      return from(fetch(Utils.skinUrlFromHash(action.hash))).pipe(
        switchMap(response => response.blob()),
        switchMap(async blob => {
          const JSZip = await import("jszip");
          return JSZip.loadAsync(blob);
        }),
        switchMap(zip => {
          return of(Actions.loadedSkinZip(zip), {
            type: "SELECTED_SKIN_README"
          });
        })
      );
    })
  );

const loadedSkinZipEpic = actions =>
  actions.pipe(
    filter(action => action.type === "LOADED_SKIN_ZIP"),
    switchMap(action => {
      // If a file is focused, but not yet loaded, try to load it now?
      return empty();
    })
  );

const focusedSkinFileEpic = (actions, states) =>
  actions.pipe(
    filter(action => action.type === "SELECTED_SKIN_FILE_TO_FOCUS"),
    switchMap(({ fileName, ext }) => {
      // TODO: Ensure this is never called with the wrong zip. Should this live in the "got zip" closure?
      const { skinZip } = states.value;
      if (skinZip == null) {
        // We don't have the skin zip yet. We trust that selectedSkinEpic will call this.
        return empty();
      }

      const methodFromExt = {
        txt: "string",
        bmp: "blob",
        cur: "blob"
      };
      return from(skinZip.file(fileName).async(methodFromExt[ext])).pipe(
        map(content => Actions.gotFocusedSkinFile(content))
      );
    })
  );

const selectSkinReadmeEpic = (actions, states) =>
  actions.pipe(
    filter(action => action.type === "SELECTED_SKIN_README"),
    switchMap(() => {
      // TODO: Ensure this is never called with the wrong zip. Should this live in the "got zip" closure?
      const { skinZip } = states.value;
      if (skinZip == null) {
        return empty();
      }

      const readmeFileName = Object.keys(skinZip.files).find(filename => {
        return (
          filename.match(/\.txt$/) &&
          ![
            "genex.txt",
            "genexinfo.txt",
            "gen_gslyrics.txt",
            "region.txt",
            "pledit.txt",
            "viscolor.txt",
            "winampmb.txt",
            "gen_ex help.txt",
            "mbinner.txt"
            // Skinning Updates.txt ?
          ].some(name => filename.match(new RegExp(name, "i")))
        );
      });
      if (readmeFileName == null) {
        return empty();
      }

      return of(Actions.selectSkinFile(readmeFileName));
    })
  );

const searchEpic = actions =>
  actions.pipe(
    filter(action => action.type === "SEARCH_QUERY_CHANGED"),
    switchMap(({ query }) => {
      if (query == null || query.length === 0) {
        return of(Actions.gotNewMatchingSkins(null));
      }

      return from(search(query)).pipe(
        map(content => {
          const matchingSkins = content.hits.map(hit => ({
            hash: hit.objectID,
            fileName: hit.fileName,
            color: hit.color
          }));
          return Actions.gotNewMatchingSkins(matchingSkins);
        })
      );
    })
  );

const randomSkinEpic = (actions, states) =>
  actions.pipe(
    filter(action => action.type === "REQUESTED_RANDOM_SKIN"),
    map(() => {
      return Actions.selectedSkin(Selectors.getRandomSkinHash(states.value));
    })
  );

const chunkState = {};

const unloadedSkinEpic = (actions, states) =>
  actions.pipe(
    filter(action => action.type === "REQUEST_UNLOADED_SKIN"),
    mergeMap(async ({ index }) => {
      const state = states.value;
      const chunkSize = state.skinChunkData.chunkSize || 100;
      const chunk = Math.floor(index / (chunkSize - 1));
      if (chunkState[chunk] != null) {
        return null;
      }
      console.log({ chunk });
      chunkState[chunk] = "fetching";
      const response = await fetch(`/skinData/skins-${chunk}.json`);
      const payload = await response.json();
      return { type: "GOT_SKIN_CHUNK", chunk, payload };
    }),
    filter(Boolean)
  );

const selectRelativeSkinEpic = (actions, states) =>
  actions.pipe(
    filter(action => action.type === "SELECT_RELATIVE_SKIN"),
    map(action => {
      const hashes = Selectors.getMatchingSkinHashes(states.value);
      const currentIndex = hashes.indexOf(
        Selectors.getSelectedSkinHash(states.value)
      );
      const nextHash =
        hashes[Utils.clamp(0, hashes.length - 1, currentIndex + action.offset)];
      return Actions.selectedSkin(nextHash);
    })
  );

export default combineEpics(
  searchEpic,
  urlChangedEpic,
  selectedSkinEpic,
  focusedSkinFileEpic,
  randomSkinEpic,
  selectRelativeSkinEpic,
  selectSkinReadmeEpic,
  loadedSkinZipEpic,
  unloadedSkinEpic
);
