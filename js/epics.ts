import { Observable, of, defer, concat } from "rxjs";
import { filter, mergeMap, catchError } from "rxjs/operators";
import { Action, AppState, Extras } from "./types";
import {
  MEDIA_TAG_REQUEST_INITIALIZED,
  SET_MEDIA_TAGS,
  MEDIA_TAG_REQUEST_FAILED,
  FETCH_MEDIA_TAGS,
} from "./actionTypes";
import { genMediaTags } from "./fileUtils";

export const fetchMediaTagsEpic = (
  actions: Observable<Action>,
  states: Observable<AppState>,
  { requireMusicMetadata }: Extras
): Observable<Action> => {
  return actions.pipe(
    filter(action => action.type === FETCH_MEDIA_TAGS),
    mergeMap(action => {
      // TODO: Check out https://github.com/piotrwitek/typesafe-actions
      if (action.type !== FETCH_MEDIA_TAGS) {
        throw new Error("Invalid");
      }
      const { file, id } = action;

      return concat(
        of({
          type: MEDIA_TAG_REQUEST_INITIALIZED,
          id,
        } as const),
        defer(async () => {
          const musicMetadata = await requireMusicMetadata();
          const metadata = await genMediaTags(file, musicMetadata);
          // There's more data here, but we don't have a use for it yet:
          const { artist, title, album, picture } = metadata.common;
          const { numberOfChannels, bitrate, sampleRate } = metadata.format;
          let albumArtUrl = null;
          if (picture && picture.length >= 1) {
            const byteArray = new Uint8Array(picture[0].data);
            const blob = new Blob([byteArray], { type: picture[0].format });
            albumArtUrl = URL.createObjectURL(blob);
          }
          return {
            type: SET_MEDIA_TAGS,
            artist: artist ? artist : "",
            title: title ? title : "",
            album,
            albumArtUrl,
            numberOfChannels,
            bitrate,
            sampleRate,
            id,
          } as const;
        }).pipe(
          catchError(e => {
            console.error("Failed to fetch media tags", e);
            return of({
              type: MEDIA_TAG_REQUEST_FAILED,
              id,
            } as const);
          })
        )
      );
    })
  );
};
