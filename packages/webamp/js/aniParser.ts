import { RIFFFile } from "riff-file";
import { unpackArray, unpackString } from "byte-data";

type Chunk = {
  format: string;
  chunkId: string;
  chunkData: {
    start: number;
    end: number;
  };
  subChunks: Chunk[];
};

// https://www.informit.com/articles/article.aspx?p=1189080&seqNum=3
export type AniMetadata = {
  cbSize: number; // Data structure size (in bytes)
  nFrames: number; // Number of images (also known as frames) stored in the file
  nSteps: number; // Number of frames to be displayed before the animation repeats
  iWidth: number; // Width of frame (in pixels)
  iHeight: number; // Height of frame (in pixels)
  iBitCount: number; // Number of bits per pixel
  nPlanes: number; // Number of color planes
  iDispRate: number; // Default frame display rate (measured in 1/60th-of-a-second units)
  bfAttributes: number; // ANI attribute bit flags
};

type AniInfo = { title: string | null; artist: string | null };

export type ParsedAni = {
  rate: number[] | null;
  seq: number[] | null;
  images: Uint8Array[];
  metadata: AniMetadata;
  artist: string | null;
  title: string | null;
};

const DWORD = { bits: 32, be: false, signed: false, fp: false };

export function parseAni(arr: Uint8Array): ParsedAni {
  const riff = new RIFFFile();

  riff.setSignature(arr);

  const signature = riff.signature as Chunk;
  if (signature.format !== "ACON") {
    throw new Error(`Expected fromat "ACON", got "${signature.format}"`);
  }

  let metadata: null | AniMetadata = null;
  let rate: number[] | null = null;
  let seq: number[] | null = null;
  let images: Uint8Array[] | null = null;
  let info: AniInfo = { artist: null, title: null };

  signature.subChunks.forEach(({ chunkId, chunkData, subChunks, format }) => {
    // TODO: Why do we need to trim here?
    switch (trimNullTerminated(chunkId)) {
      case "anih": // TODO: assert(i === 0)
        metadata = parseMetadata(arr, chunkData.start, chunkData.end);
        break;
      case "rate": // TODO: assert(i === 1)
        rate = unpackArray(arr, DWORD, chunkData.start, chunkData.end);
        break;
      case "seq": // TODO: assert(i === 2) (or 1??)
        seq = unpackArray(arr, DWORD, chunkData.start, chunkData.end);
        break;
      case "LIST": // TODO: assert(i === subChunks.length)
        switch (format) {
          case "INFO":
            info = parseInfo(arr, subChunks);
            break;
          case "fram":
            images = subChunks.map((c) => {
              if (c.chunkId !== "icon") {
                throw new Error(`Unexpected chunk type in fram: ${chunkId}`);
              }

              // TODO: We could assert that each have a chunkId of "icon"
              return arr.slice(c.chunkData.start, c.chunkData.end);
            });
        }
        break;
      default:
      // TODO: We could assert that this never happens
    }
  });

  if (metadata == null) {
    throw new Error("Did not find anih");
  }

  if (images == null) {
    throw new Error("Did not find LIST");
  }

  return { ...info, images, rate, seq, metadata };
}

function parseInfo(arr: Uint8Array, chunks: Chunk[]): AniInfo {
  const info: AniInfo = { title: null, artist: null };
  chunks.forEach((chunk) => {
    switch (chunk.chunkId) {
      case "INAM":
        info.title = trimNullTerminated(
          unpackString(arr, chunk.chunkData.start, chunk.chunkData.end)
        );
        break;
      case "IART":
        info.artist = trimNullTerminated(
          unpackString(arr, chunk.chunkData.start, chunk.chunkData.end)
        );
        break;
      default:
      // Unexpected subchunk
    }
  });
  return info;
}

function parseMetadata(
  arr: Uint8Array,
  start: number,
  end: number
): AniMetadata {
  // TODO: We could assert that we have 9 items here.
  const words = unpackArray(arr, DWORD, start, end);
  return {
    cbSize: words[0],
    nFrames: words[1],
    nSteps: words[2],
    iWidth: words[3],
    iHeight: words[4],
    iBitCount: words[5],
    nPlanes: words[6],
    iDispRate: words[7],
    bfAttributes: words[8],
  };
}

// I suspect that RIFF points to byte ranges, but that includes the byte(s?)
// used for null termination.
function trimNullTerminated(str: string): string {
  return str.trim();
}
