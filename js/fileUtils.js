import invariant from "invariant";
import readStream from "filereader-stream";

import http from "stream-http";

async function sourceToStream(source) {
  if (typeof source === "string") {
    // Assume URL
    return new Promise(resolve => {
      http.get(source, stream => {
        resolve({
          stream,
          type: stream.headers["content-type"]
        });
      });
    });
  }
  // Assume Blob
  return {
    stream: readStream(source),
    type: source.name
  };
}

export async function genMediaTags(file) {
  invariant(
    file != null,
    "Attempted to get the tags of media file without passing a file"
  );
  // Workaround https://github.com/aadsm/jsmediatags/issues/83
  if (typeof file === "string" && !/^[a-z]+:\/\//i.test(file)) {
    file = `${location.protocol}//${location.host}${location.pathname}${file}`;
  }
  return require.ensure(
    ["music-metadata"],
    async require => {
      const mm = require("music-metadata");
      const stream = await sourceToStream(file);
      stream.type = stream.type ? stream.type.split(";")[0] : stream.type; // Strip off: ; charset=UTF-8
      return mm.parseStream(stream.stream, stream.type, { duration: true });
    },
    err => {
      console.error("genMediaTags: Failed to load music-metadata");
      // The dependency failed to load
      throw err;
    },
    "music-metadata"
  );
}

export async function genMediaDuration(url) {
  invariant(
    typeof url === "string",
    "Attempted to get the duration of media file without passing a url"
  );
  return new Promise((resolve, reject) => {
    // TODO: Does this actually stop downloading the file once it's
    // got the duration?
    const audio = document.createElement("audio");
    audio.crossOrigin = "anonymous";
    const durationChange = () => {
      resolve(audio.duration);
      audio.removeEventListener("durationchange", durationChange);
      audio.url = null;
      // TODO: Not sure if this really gets cleaned up.
    };
    audio.addEventListener("durationchange", durationChange);
    audio.addEventListener("error", e => {
      reject(e);
    });
    audio.src = url;
  });
}

export async function genArrayBufferFromFileReference(fileReference) {
  invariant(
    fileReference != null,
    "Attempted to get an ArrayBuffer without assing a fileReference"
  );
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      resolve(e.target.result);
    };
    reader.onerror = function(e) {
      reject(e);
    };

    reader.readAsArrayBuffer(fileReference);
  });
}

export async function genArrayBufferFromUrl(url) {
  return new Promise((resolve, reject) => {
    const oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    oReq.onload = () => {
      const arrayBuffer = oReq.response; // Note: not oReq.responseText
      resolve(arrayBuffer);
    };
    oReq.onerror = reject;

    oReq.send(null);
  });
}

export async function promptForFileReferences({
  accept = null,
  directory = false
}) {
  return new Promise(resolve => {
    // Does this represent a memory leak somehow?
    // Can this fail? Do we ever reject?
    const fileInput = document.createElement("input");
    if (accept) fileInput.setAttribute("accept", accept);
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.webkitdirectory = directory;
    fileInput.directory = directory;
    fileInput.mozdirectory = directory;
    // Not entirely sure why this is needed, since the input
    // was just created, but somehow this helps prevent change
    // events from getting swallowed.
    // https://stackoverflow.com/a/12102992/1263117
    fileInput.value = null;
    fileInput.addEventListener("change", e => {
      resolve(e.target.files);
    });
    fileInput.click();
  });
}

function urlIsBlobUrl(url) {
  return /^blob:/.test(url);
}

// This is not perfect, but... meh: https://stackoverflow.com/a/36756650/1263117
export function filenameFromUrl(url) {
  if (urlIsBlobUrl(url)) {
    return null;
  }
  return url
    .split("/")
    .pop()
    .split("#")[0]
    .split("?")[0];
}
