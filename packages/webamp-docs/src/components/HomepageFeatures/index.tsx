import { useLayoutEffect, useState, type ReactNode } from "react";
import styles from "./styles.module.css";
import BrowserOnly from "@docusaurus/BrowserOnly";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import type { URLTrack } from "webamp";

let Webamp: typeof import("webamp").default | undefined;
if (ExecutionEnvironment.canUseDOM) {
  Webamp = require("webamp");
}

// https://freemusicarchive.org/music/netBloc_Artists/netBloc_Vol_24_tiuqottigeloot/
const album = "netBloc Vol. 24: tiuqottigeloot";
const llamaAudio =
  "https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3";

export const initialTracks: URLTrack[] = [
  {
    metaData: {
      artist: "DJ Mike Llama",
      title: "Llama Whippin' Intro",
    },
    url: llamaAudio,
    duration: 5.322286,
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Diablo_Swing_Orchestra_-_01_-_Heroines.mp3",
    duration: 322.612245,
    metaData: {
      title: "Heroines",
      artist: "Diablo Swing Orchestra",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Eclectek_-_02_-_We_Are_Going_To_Eclecfunk_Your_Ass.mp3",
    duration: 190.093061,
    metaData: {
      title: "We Are Going To Eclecfunk Your Ass",
      artist: "Eclectek",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Auto-Pilot_-_03_-_Seventeen.mp3",
    duration: 214.622041,
    metaData: {
      title: "Seventeen",
      artist: "Auto-Pilot",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Muha_-_04_-_Microphone.mp3",
    duration: 181.838367,
    metaData: {
      title: "Microphone",
      artist: "Muha",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Just_Plain_Ant_-_05_-_Stumble.mp3",
    duration: 86.047347,
    metaData: {
      title: "Stumble",
      artist: "Just Plain Ant",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Sleaze_-_06_-_God_Damn.mp3",
    duration: 226.795102,
    metaData: {
      title: "God Damn",
      artist: "Sleaze",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Juanitos_-_07_-_Hola_Hola_Bossa_Nova.mp3",
    duration: 207.072653,
    metaData: {
      title: "Hola Hola Bossa Nova",
      artist: "Juanitos",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Entertainment_for_the_Braindead_-_08_-_Resolutions_Chris_Summer_Remix.mp3",
    duration: 314.331429,
    metaData: {
      title: "Resolutions (Chris Summer Remix)",
      artist: "Entertainment for the Braindead",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Nobara_Hayakawa_-_09_-_Trail.mp3",
    duration: 204.042449,
    metaData: {
      title: "Trail",
      artist: "Nobara Hayakawa",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Paper_Navy_-_10_-_Tongue_Tied.mp3",
    duration: 201.116735,
    metaData: {
      title: "Tongue Tied",
      artist: "Paper Navy",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/60_Tigres_-_11_-_Garage.mp3",
    duration: 245.394286,
    metaData: {
      title: "Garage",
      artist: "60 Tigres",
      album,
    },
  },
  {
    url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/CM_aka_Creative_-_12_-_The_Cycle_Featuring_Mista_Mista.mp3",
    duration: 221.44,
    metaData: {
      title: "The Cycle (Featuring Mista Mista)",
      artist: "CM aka Creative",
      album,
    },
  },
];

function WebampComponent(): ReactNode {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!ref || !Webamp) {
      return;
    }
    const webamp = new Webamp({
      initialTracks,
    });
    webamp.renderWhenReady(ref);

    return () => {
      // Cleanup Webamp instance when the component unmounts
      webamp.dispose();
    };
  }, [ref]);

  return <div ref={setRef} style={{ height: "100%", width: "100%" }}></div>;
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row" style={{ height: "400px" }}>
          <BrowserOnly>{() => <WebampComponent />}</BrowserOnly>
        </div>
      </div>
    </section>
  );
}
