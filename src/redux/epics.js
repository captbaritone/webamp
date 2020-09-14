import { combineEpics } from "redux-observable";
import { of, from, EMPTY, concat } from "rxjs";
import * as Actions from "./actionCreators";
import * as Selectors from "./selectors";
import * as Utils from "../utils";
import {
  tap,
  filter,
  switchMap,
  map,
  mergeMap,
  takeUntil,
  catchError,
  ignoreElements,
  distinctUntilChanged,
  startWith,
} from "rxjs/operators";
import { search } from "../algolia";
import queryParser from "../queryParser";
import { API_URL, CHUNK_SIZE } from "../constants";
import * as UploadUtils from "../uploadUtils";

const urlChangedEpic = (actions) =>
  actions.pipe(
    filter((action) => action.type === "URL_CHANGED"),
    switchMap((action) => {
      if (action.location.pathname === "/about/") {
        return of(Actions.requestedAboutPage());
      }
      if (action.location.pathname === "/upload/") {
        return of(Actions.requestedUploadPage());
      }
      const params = new URLSearchParams(action.location.search);
      const query = params != null && params.get("query");

      if (action.location.pathname.startsWith("/skin/")) {
        const segments = action.location.pathname.split("/");
        const actions = [Actions.selectedSkin(segments[2])];
        if (segments[4] === "files") {
          actions.push(
            // For now this is always the readme, so we don't need it.
            // Actions.selectSkinFile(segments[5]),
            Actions.openFileExplorer()
          );
        }
        return of(...actions);
      }
      return of(Actions.searchQueryChanged(query || ""));
    })
  );

const selectedSkinEpic = (actions) =>
  actions.pipe(
    filter((action) => action.type === "SELECTED_SKIN"),
    switchMap((action) => {
      return from(fetch(Utils.skinUrlFromHash(action.hash))).pipe(
        switchMap((response) => response.blob()),
        switchMap(async (blob) => {
          const JSZip = await import("jszip");
          return JSZip.loadAsync(blob);
        }),
        switchMap((zip) => {
          return of(Actions.loadedSkinZip(zip), {
            type: "SELECTED_SKIN_README",
          });
        })
      );
    })
  );

const loadedSkinZipEpic = (actions) =>
  actions.pipe(
    filter((action) => action.type === "LOADED_SKIN_ZIP"),
    switchMap((action) => {
      // If a file is focused, but not yet loaded, try to load it now?
      return EMPTY;
    })
  );

const focusedSkinFileEpic = (actions, states) =>
  actions.pipe(
    filter((action) => action.type === "SELECTED_SKIN_FILE_TO_FOCUS"),
    switchMap(({ fileName, ext }) => {
      // TODO: Ensure this is never called with the wrong zip. Should this live in the "got zip" closure?
      const { skinZip } = states.value;
      if (skinZip == null) {
        // We don't have the skin zip yet. We trust that selectedSkinEpic will call this.
        return EMPTY;
      }

      const methodFromExt = {
        txt: "string",
        bmp: "blob",
        cur: "blob",
      };
      return from(skinZip.file(fileName).async(methodFromExt[ext])).pipe(
        map((content) => Actions.gotFocusedSkinFile(content))
      );
    })
  );

const selectSkinReadmeEpic = (actions, states) =>
  actions.pipe(
    filter((action) => action.type === "SELECTED_SKIN_README"),
    map(() => states.value.skinZip),
    filter(Boolean),
    map((skinZip) => {
      return Object.keys(skinZip.files).find((filename) => {
        return Utils.filenameIsReadme(filename);
      });
    }),
    switchMap((readmeFileName) => {
      return readmeFileName == null
        ? EMPTY
        : of(Actions.selectSkinFile(readmeFileName));
    })
  );

const searchEpic = (actions) =>
  actions.pipe(
    filter((action) => action.type === "SEARCH_QUERY_CHANGED"),
    switchMap(({ query }) => {
      if (query == null || query.length === 0) {
        return of(Actions.gotNewMatchingSkins(null));
      }

      const [newQuery, options] = queryParser(query);

      return from(search(newQuery, options)).pipe(
        map((content) => {
          const matchingSkins = content.hits.map((hit) => ({
            hash: hit.objectID,
            fileName: hit.fileName,
            color: hit.color,
            // TODO: Some records still have float scores not booleans. Ignore those.
            nsfw: hit.nsfw === true,
          }));
          return Actions.gotNewMatchingSkins(matchingSkins);
        })
      );
    })
  );

const randomSkinEpic = (actions, states) =>
  actions.pipe(
    filter((action) => action.type === "REQUESTED_RANDOM_SKIN"),
    map(() => Actions.selectedSkin(Selectors.getRandomSkinHash(states.value)))
  );

const chunkState = {};

const unloadedSkinEpic = (actions, states) =>
  actions.pipe(
    filter((action) => action.type === "REQUEST_UNLOADED_SKIN"),
    mergeMap(async ({ index }) => {
      const chunk = Math.floor(index / (CHUNK_SIZE - 1));

      if (chunkState[chunk] != null) {
        return null;
      }
      chunkState[chunk] = "fetching";
      const response = await fetch(
        `${API_URL}/skins?offset=${chunk * CHUNK_SIZE}&first=${CHUNK_SIZE}`
      );

      const body = await response.json();
      return [body, chunk];
    }),
    filter(Boolean),
    mergeMap(([body, chunk]) => {
      return of(
        { type: "GOT_SKIN_CHUNK", chunk, payload: body.skins },
        { type: "GOT_TOTAL_NUMBER_OF_SKINS", number: body.skinCount }
      );
    })
  );

const selectRelativeSkinEpic = (actions, states) =>
  actions.pipe(
    filter((action) => action.type === "SELECT_RELATIVE_SKIN"),
    map((action) => {
      const hashes = Selectors.getMatchingSkinHashes(states.value);
      const currentIndex = hashes.indexOf(
        Selectors.getSelectedSkinHash(states.value)
      );
      const nextHash =
        hashes[Utils.clamp(0, hashes.length - 1, currentIndex + action.offset)];
      return Actions.selectedSkin(nextHash);
    })
  );

function takeUntilAction(actions, actionType) {
  return takeUntil(
    actions.pipe(filter((action) => action.type === actionType))
  );
}

const gotFilesEpic = (actions) =>
  actions.pipe(
    filter((action) => action.type === "GOT_FILES"),
    mergeMap(({ files }) => {
      return concat(
        of(Actions.toggleUploadView()),
        from(files.map((file) => Actions.gotFile(file, Utils.uniqueId())))
      ).pipe(takeUntilAction(actions, "CLOSE_UPLOAD_FILES"));
    })
  );

const uploadSingleFileEpic = (actions) =>
  actions.pipe(
    filter((action) => action.type === "GOT_FILE"),
    mergeMap(({ file, id }) => {
      if (!UploadUtils.isValidSkinFilename(file.name)) {
        return of(Actions.invalidFileExtension(id));
      }
      return from(UploadUtils.isClassicSkin(file))
        .pipe(
          mergeMap((isClassic) => {
            if (!isClassic) {
              return of(Actions.notClassicSkin(id));
            }
            return from(UploadUtils.hashFile(file)).pipe(
              map((md5) => {
                return Actions.gotFileMd5(id, md5);
              })
            );
          })
        )
        .pipe(takeUntilAction(actions, "CLOSE_UPLOAD_FILES"));
    })
  );

const checkIfUploadsAreMissingEpic = (actions, state) =>
  actions.pipe(
    filter((action) => {
      return (
        action.type === "GOT_FILE_MD5" &&
        Selectors.getAreReadyToCheckMissingUploads(state.value)
      );
    }),
    mergeMap(() => {
      const md5s = Selectors.getUploadedFilesMd5s(state.value);
      return from(UploadUtils.checkMd5sAreMissing(md5s))
        .pipe(
          map(({ missing, found }) =>
            Actions.gotMissingAndFoundMd5s({ missing, found })
          ),
          catchError((e) => {
            console.error("Failed fo check missing skins", e);
            // TODO: A real error here.
            alert(
              "Sorry. We had a problem checking which files are missing. Please contact jordan@jordaneldredge.com for help."
            );
            return of(Actions.closeUploadFiles());
          })
        )
        .pipe(takeUntilAction(actions, "CLOSE_UPLOAD_FILES"));
    })
  );

function uploadActions(file) {
  return concat(
    of(Actions.startingFileUpload(file.id)),
    from(UploadUtils.upload(file.file)).pipe(
      map((response) => {
        if (response.status === "ADDED") {
          return Actions.archivedSkin(file.id, response);
        }
        if (response.status === "FOUND") {
          // Maybe we could do something better here?
        }
        console.error(response);
        return Actions.uploadFailed(file.id);
      }),
      catchError(() => of(Actions.uploadFailed(file.id)))
    )
  );
}

const uploadFilesEpic = (actions, state) =>
  actions.pipe(
    filter((action) => action.type === "TRY_TO_UPLOAD_FILE"),
    mergeMap(({ id }) => {
      const file = state.value.fileUploads[id];
      return uploadActions(file).pipe(
        takeUntilAction(actions, "CLOSE_UPLOAD_FILES")
      );
    })
  );

// When TRY_TO_UPLOAD_ALL_FILES is dispatched, upload a file and recursively
// dispatch until no uploadable files are found
const uploadAllFilesEpic = (actions, state) =>
  actions.pipe(
    filter((action) => action.type === "TRY_TO_UPLOAD_ALL_FILES"),
    mergeMap(() => {
      const file = Selectors.getFileToUpload(state.value);
      if (file == null) {
        return EMPTY;
      }
      return concat(
        uploadActions(file),
        of(Actions.tryToUploadAllFiles())
      ).pipe(takeUntilAction(actions, "CLOSE_UPLOAD_FILES"));
    })
  );

const loggingEpic = (actions, state) =>
  actions.pipe(
    tap((action) => {
      // ga('send', 'event', [eventCategory], [eventAction], [eventLabel], [eventValue], [fieldsObject]);
      switch (action.type) {
        case "CONCENTS_TO_N_SFW":
        case "DOES_NOT_CONCENT_TO_NSFW":
        case "CLOSE_UPLOAD_FILES":
        case "GOT_FILE_MD5":
        case "ARCHIVED_SKIN":
        case "TRY_TO_UPLOAD_FILE":
        case "UPLOAD_FAILED":
        case "STARTING_FILE_UPLOAD":
        case "TRY_TO_UPLOAD_ALL_FILES":
        case "INVALID_FILE_EXTENSION":
        case "GOT_FILE":
        case "NOT_CLASSIC_SKIN":
        case "GOT_MISSING_AND_FOUND_MD5S":
          window.ga("send", "event", "redux", action.type);
          break;
        default: {
        }
      }
    }),
    ignoreElements()
  );

const urlEpic = (actions, state) => {
  return actions.pipe(
    map(() => Selectors.getUrl(state.value)),
    distinctUntilChanged(),
    startWith(window.location),
    tap((url) => {
      window.ga("set", "page", url);
      window.history.replaceState({}, Selectors.getPageTitle(state), url);
    }),
    ignoreElements()
  );
};

const skinDataEpic = (actions, state) => {
  return actions.pipe(
    filter((action) => action.type === "SELECTED_SKIN"),
    switchMap(({ hash }) => {
      const skinData = state.value.skins[hash];
      if (
        skinData == null ||
        skinData.color == null ||
        skinData.fileName == null
      ) {
        return from(fetch(`${API_URL}/skins/${hash}`)).pipe(
          switchMap((response) => response.json()),
          map((body) =>
            Actions.gotSkinData(hash, {
              md5: hash,
              fileName: body.canonicalFilename,
              color: body.averageColor,
              nsfw: body.nsfw,
            })
          )
        );
      }
      return EMPTY;
    })
  );
};

export default combineEpics(
  searchEpic,
  urlChangedEpic,
  selectedSkinEpic,
  focusedSkinFileEpic,
  randomSkinEpic,
  selectRelativeSkinEpic,
  selectSkinReadmeEpic,
  loadedSkinZipEpic,
  unloadedSkinEpic,
  gotFilesEpic,
  uploadFilesEpic,
  uploadAllFilesEpic,
  uploadSingleFileEpic,
  checkIfUploadsAreMissingEpic,
  urlEpic,
  loggingEpic,
  skinDataEpic
);
