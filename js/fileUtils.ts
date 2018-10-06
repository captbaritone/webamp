import invariant from "invariant";
import { IAudioMetadata, IOptions } from "music-metadata-browser";

interface MusicMetadataBrowser {

  /**
   * Parse Web API File
   * @param {Blob} blob
   * @param {IOptions} options Parsing options
   * @returns {Promise<IAudioMetadata>}
   */
  parseBlob(blob: Blob, options?: IOptions): Promise<IAudioMetadata>;

  /**
   * Parse fetched file, using the Web Fetch API
   * @param {string} audioTrackUrl URL to download the audio track from
   * @param {IOptions} options Parsing options
   * @returns {Promise<IAudioMetadata>}
   */
  fetchFromUrl(audioTrackUrl: string, options?: IOptions): Promise<IAudioMetadata>;
}

type JsMediaTagsFile = string | ArrayBuffer | Blob;

export function genMediaTags(
  file: JsMediaTagsFile,
  mm: MusicMetadataBrowser
): Promise<IAudioMetadata> {
  invariant(
    file != null,
    "Attempted to get the tags of media file without passing a file"
  );
  // Workaround https://github.com/aadsm/jsmediatags/issues/83
  if (typeof file === "string" && !/^[a-z]+:\/\//i.test(file)) {
    file = `${location.protocol}//${location.host}${location.pathname}${file}`;
  }
  if (typeof file === "string") {
    console.log(`genMediaTags(): Parsing url=${file}`);
    return mm.fetchFromUrl(file, {
      duration: true,
      skipPostHeaders: true // avoid unnecessary data to be read
    });
  }
  // Assume Blob
  return mm.parseBlob(file as Blob, {
    duration: true,
    skipPostHeaders: true // avoid unnecessary data to be read
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
    accept: null,
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
