import llamaAudio from "../mp3/llama-2.91.mp3";

const { hash } = window.location;
let config = {};
if (hash) {
  try {
    config = JSON.parse(decodeURIComponent(hash).slice(1));
  } catch (e) {
    console.error("Failed to decode config from hash: ", hash);
  }
}

// Backwards compatibility with the old syntax
if (config.audioUrl && !config.initialTracks) {
  config.initialTracks = [{ url: config.audioUrl }];
}

export const skinUrl = config.skinUrl === undefined ? null : config.skinUrl;
export const initialTracks = config.initialTracks || [
  {
    metaData: { artist: "DJ Mike Llama", title: "Llama Whippin' Intro" },
    url: llamaAudio,
    duration: 5.322286
  },
  {
    url:
      "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Diablo_Swing_Orchestra_-_01_-_Heroines.mp3",
    duration: 322.612245,
    metaData: {
      title: "Heroines",
      artist: "Diablo Swing Orchestra"
    }
  },
  {
    url:
      "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Eclectek_-_02_-_We_Are_Going_To_Eclecfunk_Your_Ass.mp3",
    duration: 190.093061,
    metaData: {
      title: "We Are Going To Eclecfunk Your Ass",
      artist: "Eclectek"
    }
  },
  {
    url:
      "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Auto-Pilot_-_03_-_Seventeen.mp3",
    duration: 214.622041,
    metaData: {
      title: "Seventeen",
      artist: "Auto-Pilot"
    }
  },
  {
    url:
      "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Muha_-_04_-_Microphone.mp3",
    duration: 181.838367,
    metaData: {
      title: "Microphone",
      artist: "Muha"
    }
  },
  {
    url:
      "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Just_Plain_Ant_-_05_-_Stumble.mp3",
    duration: 86.047347,
    metaData: {
      title: "Stumble",
      artist: "Just Plain Ant"
    }
  },
  {
    url:
      "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Sleaze_-_06_-_God_Damn.mp3",
    duration: 226.795102,
    metaData: {
      title: "God Damn",
      artist: "Sleaze"
    }
  },
  {
    url:
      "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Juanitos_-_07_-_Hola_Hola_Bossa_Nova.mp3",
    duration: 207.072653,
    metaData: {
      title: "Hola Hola Bossa Nova",
      artist: "Juanitos"
    }
  },
  {
    url:
      "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Entertainment_for_the_Braindead_-_08_-_Resolutions_Chris_Summer_Remix.mp3",
    duration: 314.331429,
    metaData: {
      title: "Resolutions (Chris Summer Remix)",
      artist: "Entertainment for the Braindead"
    }
  },
  {
    url:
      "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Nobara_Hayakawa_-_09_-_Trail.mp3",
    duration: 204.042449,
    metaData: {
      title: "Trail",
      artist: "Nobara Hayakawa"
    }
  },
  {
    url:
      "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Paper_Navy_-_10_-_Tongue_Tied.mp3",
    duration: 201.116735,
    metaData: {
      title: "Tongue Tied",
      artist: "Paper Navy"
    }
  },
  {
    url:
      "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/60_Tigres_-_11_-_Garage.mp3",
    duration: 245.394286,
    metaData: {
      title: "Garage",
      artist: "60 Tigres"
    }
  },
  {
    url:
      "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/CM_aka_Creative_-_12_-_The_Cycle_Featuring_Mista_Mista.mp3",
    duration: 221.44,
    metaData: {
      title: "The Cycle (Featuring Mista Mista)",
      artist: "CM aka Creative"
    }
  }
];

export const disableMarquee = config.disableMarquee || false;
export const initialState = config.initialState || undefined;
