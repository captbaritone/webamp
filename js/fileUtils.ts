import invariant from "invariant";

export interface MediaTags {
  tags: {
    artist: string;
    title: string;
    picture: {
      data: number[];
      type: string;
    };
  };
}

type JsMediaTagsFile = string | ArrayBuffer | Blob;
interface JsMediaTagsHandlers {
  onSuccess: (tags: MediaTags) => void;
  onError: (error: Error) => void;
}

interface JsMediaTags {
  read: (file: JsMediaTagsFile, handlers: JsMediaTagsHandlers) => void;
}

export function genMediaTags(
  file: JsMediaTagsFile,
  jsmediatags: JsMediaTags
): Promise<MediaTags> {
  invariant(
    file != null,
    "Attempted to get the tags of media file without passing a file"
  );
  // Workaround https://github.com/aadsm/jsmediatags/issues/83
  if (typeof file === "string" && !/^[a-z]+:\/\//i.test(file)) {
    file = `${location.protocol}//${location.host}${location.pathname}${file}`;
  }
  return new Promise((resolve, reject) => {
    try {
      jsmediatags.read(file, { onSuccess: resolve, onError: reject });
    } catch (e) {
      // Possibly jsmediatags could not find a parser for this file?
      // Nothing to do.
      // Consider removing this after https://github.com/aadsm/jsmediatags/issues/83 is resolved.
      reject(e);
    }
  });
}

export function genMediaDuration(url: string): Promise<number> {
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
      audio.src = "";
      // TODO: Not sure if this really gets cleaned up.
    };
    audio.addEventListener("durationchange", durationChange);
    audio.addEventListener("error", e => {
      reject(e);
    });
    audio.src = url;
  });
}

export async function genArrayBufferFromFileReference(
  fileReference: File
): Promise<any> {
  invariant(
    fileReference != null,
    "Attempted to get an ArrayBuffer without assing a fileReference"
  );
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(fileReference);
  });
}

interface PromptForFileReferenceOptions {
  accept?: string | null;
  directory?: boolean;
}

export async function promptForFileReferences(
  { accept, directory = false }: PromptForFileReferenceOptions = {
    accept,
    directory: false
  }
): Promise<FileList> {
  return new Promise((resolve: (fileList: FileList) => void) => {
    // Does this represent a memory leak somehow?
    // Can this fail? Do we ever reject?
    const fileInput = document.createElement("input");
    if (accept) fileInput.setAttribute("accept", accept);
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.webkitdirectory = directory;
    // @ts-ignore Non-standard
    fileInput.directory = directory;
    // @ts-ignore Non-standard
    fileInput.mozdirectory = directory;
    // Not entirely sure why this is needed, since the input
    // was just created, but somehow this helps prevent change
    // events from getting swallowed.
    // https://stackoverflow.com/a/12102992/1263117

    // @ts-ignore Technically you can't set this to null, it has to be a string.
    // But I don't feel like retesting it, so I'll leave it as null
    fileInput.value = null;
    fileInput.addEventListener("change", (e: Event) => {
      const files = (<HTMLInputElement>e.target).files;
      resolve(files as FileList);
    });
    fileInput.click();
  });
}

function urlIsBlobUrl(url: string): boolean {
  return /^blob:/.test(url);
}

// This is not perfect, but... meh: https://stackoverflow.com/a/36756650/1263117
export function filenameFromUrl(url: string): string | null {
  if (urlIsBlobUrl(url)) {
    return null;
  }

  const lastSegment = url.split("/").pop();
  if (lastSegment == null) {
    return null;
  }
  return lastSegment.split("#")[0].split("?")[0];
}
