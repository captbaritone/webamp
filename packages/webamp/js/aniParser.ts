import { RIFFFile } from "riff-file";
import { unpackArray } from "byte-data";

export function parseAni(arr) {
  let riff = new RIFFFile();

  riff.setSignature(arr);

  const { signature } = riff;
  if (signature.format !== "ACON") {
    throw new Error(`Invalid format. Expected "ACON", got ${signature.format}`);
  }

  const metaChunk = signature.subChunks[0];
  if (metaChunk.chunkId !== "anih") {
    throw new Error(
      `Invalid ANIHEADER chunkId. Expected "anih", got ${metaChunk.chunkId}`
    );
  }

  const metaData = parseMetadata(getChunkData(arr, metaChunk));

  // TODO: Read metadata
  // TODO: Handle the optional "rate" chunk;

  const list = signature.subChunks[signature.subChunks.length - 1];
  if (list.chunkId !== "LIST") {
    throw new Error(
      `Invalid LIST chunkId. Expected "LIST", got ${list.chunkId}`
    );
  }

  const urls = list.subChunks.map((chunk) => {
    if (chunk.chunkId !== "icon") {
      throw new Error(
        `Invalid icon chunkId. Expected "icon", got ${chunk.chunkId}`
      );
    }
    const iconArr = getChunkData(arr, chunk);
    return urlFromData(iconArr);
  });

  return { urls, ...metaData };
}

const DWORD = { bits: 32, be: false, signed: false, fp: false };
function parseMetadata(chunkData) {
  const words = unpackArray(chunkData, DWORD);
  if (words.length !== 9) {
    throw new Error(
      `Expected nine DWORDs of metadata in the "anih" section, but got ${words.length}`
    );
  }
  return {
    cbSize: words[0], // Data structure size (in bytes)
    nFrames: words[1], // Number of images (also known as frames) stored in the file
    nSteps: words[2], // Number of frames to be displayed before the animation repeats
    iWidth: words[3], // Width of frame (in pixels)
    iHeight: words[4], // Height of frame (in pixels)
    iBitCount: words[5], // Number of bits per pixel
    nPlanes: words[6], // Number of color planes
    iDispRate: words[7], // Default frame display rate (measured in 1/60th-of-a-second units)
    bfAttributes: words[9], // ANI attribute bit flags
  };
}

function base64(u8) {
  return btoa(String.fromCharCode.apply(null, u8));
}

function urlFromData(arr) {
  const arrBase64 = base64(arr);
  return `data:image/x-win-bitmap;base64,${arrBase64}`;
}

function getChunkData(arr, chunk) {
  return arr.slice(chunk.chunkData.start, chunk.chunkData.end);
}
