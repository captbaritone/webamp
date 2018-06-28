const defaultTracksState = {
  "0": {
    selected: false,
    title: "Llama Whipping Intro",
    artist: "DJ Mike Llama",
    duration: "5",
    url: ""
  },
  "1": {
    selected: false,
    title: "Rock Is Dead",
    artist: "Marilyn Manson",
    duration: "191", // 3:11
    url: ""
  },
  "2": {
    selected: true,
    title: "Spybreak! (Short One)",
    artist: "Propellerheads",
    duration: "240", // 4:00
    url: ""
  },
  "3": {
    selected: false,
    title: "Bad Blood",
    artist: "Ministry",
    duration: "300", // 5:00
    url: ""
  }
};

const initialState = {
  equalizer: {
    sliders: {
      "60": 52,
      "170": 74,
      "310": 83,
      "600": 91,
      "1000": 74,
      "3000": 54,
      "6000": 23,
      "12000": 19,
      "14000": 34,
      "16000": 75,
      preamp: 56
    }
  },
  media: {
    status: "PLAYING",
    kbps: 128,
    khz: 44,
    length: 5,
    timeElapsed: 1, // This does not seem to work
    channels: 2,
    name: "1. DJ Mike Llama - Llama Whippin' Intro"
  },
  playlist: {
    tracks: defaultTracksState,
    trackOrder: [0, 1, 2, 3],
    currentTrack: 0
  },
  display: {
    working: false
  }
};

export default initialState;
