import { PlaylistTrack } from "./types";
import * as Utils from "./utils";
import * as FileUtils from "./fileUtils";

export const trackName = Utils.weakMapMemoize(
  (track: PlaylistTrack): string => {
    const { artist, title, defaultName, url } = track;
    if (artist && title) {
      return `${artist} - ${title}`;
    } else if (title) {
      return title;
    } else if (defaultName) {
      return defaultName;
    } else if (url) {
      const filename = FileUtils.filenameFromUrl(url);
      if (filename) {
        return filename;
      }
    }
    return "???";
  }
);

export const trackFilename = Utils.weakMapMemoize(
  (track: PlaylistTrack): string => {
    if (track.url) {
      const urlFilename = FileUtils.filenameFromUrl(track.url);
      if (urlFilename != null) {
        return urlFilename;
      }
    }
    if (track.defaultName) {
      return track.defaultName;
    }
    return "???";
  }
);
