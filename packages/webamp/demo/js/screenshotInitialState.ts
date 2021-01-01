import { DeepPartial } from "redux";
import { AppState } from "./Webamp";

const defaultTracksState = {
  "0": {
    id: 0,
    title: "Llama Whipping Intro",
    artist: "DJ Mike Llama",
    duration: 5,
    url: "",
    kbps: "128",
    khz: "44",
    channels: 2,
  },
  "1": {
    id: 1,
    title: "Rock Is Dead",
    artist: "Marilyn Manson",
    duration: 191, // 3:11
    url: "",
    kbps: "128",
    khz: "44",
    channels: 2,
  },
  "2": {
    id: 2,
    title: "Spybreak! (Short One)",
    artist: "Propellerheads",
    duration: 240, // 4:00
    url: "",
    kbps: "128",
    khz: "44",
    channels: 2,
  },
  "3": {
    id: 3,
    title: "Bad Blood",
    artist: "Ministry",
    duration: 300, // 5:00
    url: "",
    kbps: "128",
    khz: "44",
    channels: 2,
  },
};

const initialState: DeepPartial<AppState> = {
  equalizer: {
    sliders: {
      "60": 52,
      "170": 74,
      "310": 83,
      "600": 91,
      "1000": 80,
      "3000": 54,
      "6000": 23,
      "12000": 19,
      "14000": 34,
      "16000": 75,
      preamp: 56,
    },
  },
  media: {
    status: "PLAYING",
    timeElapsed: 3,
  },
  playlist: {
    trackOrder: [0, 1, 2, 3],
    currentTrack: 0,
    selectedTracks: new Set([2]),
  },
  tracks: defaultTracksState,
  display: {
    working: false,
  },
};

export default initialState;
