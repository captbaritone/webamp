import { parse, parseV1Tag, parseV2Tag } from "id3-parser";
import { ITags } from "id3-parser/lib/interface";
import { calcTagSize } from "id3-parser/lib/parsers/v2parser";
import { fetchFileAsBuffer } from "id3-parser/lib/universal/helpers";
import { assume } from "../utils";
import { Track } from "./AudioPlayer";

export async function parseMetaData(
  track: Track,
  callback: Function
): Promise<void> {
  try {
    const audioTrackUrl = track.file
      ? URL.createObjectURL(track.file)
      : track.filename;

    //? Duration
    // track.duration = await genMediaDuration(audioTrackUrl);
    // callback();
    genMediaDuration(audioTrackUrl).then((duration) => {
      track.duration = duration;
      callback();
    });

    //? don't await
    genMetadata(track, audioTrackUrl, callback)
  } catch (e) {
    // TODO: Should we update the state to indicate that we don't know the length?
    console.warn("ERROR:", e);
  }
}

async function genMetadata(
  track: Track,
  audioTrackUrl: string,
  callback: Function
) {


  //? ID3
  const bytes: Uint8Array = await fetchFileAsBuffer(audioTrackUrl);
  let id3: ITags;
  const v2data = parseV2Tag(bytes);
  if (v2data) {
    id3 = { ...v2data };
  } else {
    const v1data = parseV1Tag(bytes);
    id3 = { ...v1data };
  }
  track.metadata = id3;
  // console.log("ID3:", id3);
  callback();

  //? Bitrate & SampleRate
  let start: number = 0;
  if (v2data) {
    start = 10; // normal v2 headerSize
    // const xHeader = (bytes[5] & 0x40) !== 0
    if (v2data.version.flags.xheader) {
      start += calcTagSize(bytes.slice(10, 14));
    }
    start += calcTagSize(bytes.slice(6, 10)); // tagSize
  }
  // frame found ===========================================================
  // pos starts at 0

  const VersionID = [2.5, null, 2, 1];
  const LayerDescription = [0, 3, 2, 1];
  const ChannelMode = ["stereo", "joint_stereo", "dual_channel", "mono"];

  const sampling_rate_freq_index = {
    1: { 0x00: 44100, 0x01: 48000, 0x02: 32000 },
    2: { 0x00: 22050, 0x01: 24000, 0x02: 16000 },
    2.5: { 0x00: 11025, 0x01: 12000, 0x02: 8000 },
  };

  const samplesInFrameTable = [
    /* Layer   I    II   III */
    [0, 384, 1152, 1152], // MPEG-1
    [0, 384, 1152, 576], // MPEG-2(.5
  ];

  // get header
  var header =
    (bytes[start] << 24) |
    (bytes[start + 1] << 16) |
    (bytes[start + 2] << 8) |
    bytes[start + 3];

  var versionIndex = readBits(header, 11, 2);
  // info.version = ["MPEG 2.5", "reserved", "MPEG 2.0", "MPEG 1.0"][
  //   versionIndex
  // ];
  const version = VersionID[versionIndex];

  var layerIndex = readBits(header, 13, 2);
  // info.layer = ["reserved", "layer 3", "layer 2", "layer 1"][layerIndex];
  const layer = LayerDescription[layerIndex];

  var isProtected = readBits(header, 15, 1);
  // info.crc = !isProtected;

  // bitrate for the first frame, can change per frame if its VBR
  var bitrateIndex = readBits(header, 16, 4);
  var sampRateFreqIndex = readBits(header, 20, 2);

  //? calc Bitrate
  const bitrate_index = {
    0x01: { 11: 32, 12: 32, 13: 32, 21: 32, 22: 8, 23: 8 },
    0x02: { 11: 64, 12: 48, 13: 40, 21: 48, 22: 16, 23: 16 },
    0x03: { 11: 96, 12: 56, 13: 48, 21: 56, 22: 24, 23: 24 },
    0x04: { 11: 128, 12: 64, 13: 56, 21: 64, 22: 32, 23: 32 },
    0x05: { 11: 160, 12: 80, 13: 64, 21: 80, 22: 40, 23: 40 },
    0x06: { 11: 192, 12: 96, 13: 80, 21: 96, 22: 48, 23: 48 },
    0x07: { 11: 224, 12: 112, 13: 96, 21: 112, 22: 56, 23: 56 },
    0x08: { 11: 256, 12: 128, 13: 112, 21: 128, 22: 64, 23: 64 },
    0x09: { 11: 288, 12: 160, 13: 128, 21: 144, 22: 80, 23: 80 },
    0x0a: { 11: 320, 12: 192, 13: 160, 21: 160, 22: 96, 23: 96 },
    0x0b: { 11: 352, 12: 224, 13: 192, 21: 176, 22: 112, 23: 112 },
    0x0c: { 11: 384, 12: 256, 13: 224, 21: 192, 22: 128, 23: 128 },
    0x0d: { 11: 416, 12: 320, 13: 256, 21: 224, 22: 144, 23: 144 },
    0x0e: { 11: 448, 12: 384, 13: 320, 21: 256, 22: 160, 23: 160 },
  };
  const codecIndex = `${Math.floor(version)}${layer}`;
  id3.bitrate = bitrate_index[bitrateIndex][codecIndex];

  // info.sampleRate = info.raw.sampleRate = [
  //   //  MPEG-1  MPEG-2  MPEG-3
  //   [44100, 22050, 11025],
  //   [48000, 24000, 12000],
  //   [32000, 16000, 8000],
  //   [-1, -1, -1], // reserved
  // ][sampRateFreqIndex][3 - versionIndex];
  // info.sampleRate = info.sampleRate + "Hz";

  //? calc samplerate
  // if (this.sampRateFreqIndex === 0x03) return null; // 'reserved'
  id3.sampleRate = sampling_rate_freq_index[version][sampRateFreqIndex];

  // var isPadded = (info.raw.padded = readBits(header, 22, 1));
  // info.padded = isPadded == 1;

  // var isPrivate = (info.raw.private = readBits(header, 23, 1));
  // info.private = isPrivate == 1;

  var channels = readBits(header, 24, 2);
  // info.channelMode = [
  //   "Stereo",
  //   "Joint Stereo",
  //   "Dual Channel",
  //   "Single Channel",
  // ][channels];
  const channelModeIndex = channels;
  id3.channelMode = ChannelMode[channelModeIndex];

  // per frame thing, not really interesting
  // if (channels == 1) {
  //   var channelsExtension = (info.raw.channelsExtension = readBits(
  //     header,
  //     26,
  //     2
  //   ));
  //   if (layer == 1)
  //     info.channelExtension = {
  //       bands: [
  //         [4, 31],
  //         [8, 31],
  //         [12, 31],
  //         [16, 31],
  //       ][channelsExtension],
  //     };
  //   else
  //     info.channelExtension = {
  //       msStereo: [false, false, true, true][channelsExtension],
  //       intensityStereo: [false, true, false, true][channelsExtension],
  //     };
  // }

  // var isCopyrighted = (info.raw.copyrighted = readBits(header, 28, 1));
  // info.copyrighted = isCopyrighted == 1;

  // var isOriginal = (info.raw.original = readBits(header, 29, 1));
  // info.original = isOriginal == 1;

  // var emphasis = (info.raw.emphasis = readBits(header, 30, 2));
  // info.emphasis = ["None", "50/15 ms", "Reserved", "CCIT J.17"][emphasis];

  track.metadata = id3;
  // console.log("Final ID3:", id3);
  callback();

  //debug
  // console.log("original Parse:", parse(bytes));
  // } catch (e) {
  //   // TODO: Should we update the state to indicate that we don't know the length?
  //   console.warn("ERROR:", e);
  // }
}

function readBits(int: number, pos: number, length: number) {
  var mask = (0xffffffff >>> (32 - length)) << (32 - length - pos);
  return (int & mask) >>> (32 - length - pos);
}

function genMediaDuration(url: string): Promise<number> {
  assume(
    typeof url === "string",
    "Attempted to get the duration of media file without passing a url"
  );
  return new Promise((resolve, reject) => {
    // TODO: Does this actually stop downloading the file once it's
    // got the duration?
    const audio = document.createElement("audio") as HTMLAudioElement;
    audio.crossOrigin = "anonymous";
    const durationChange = () => {
      resolve(audio.duration);
      audio.removeEventListener("durationchange", durationChange);

      audio.src = "";
      // TODO: Not sure if this really gets cleaned up.
    };
    audio.addEventListener("durationchange", durationChange);
    audio.addEventListener("error", (e) => {
      reject(e);
    });
    audio.src = url;
  });
}
