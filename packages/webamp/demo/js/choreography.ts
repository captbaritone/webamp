import Webamp from "../../js/webampLazy";
import { Slider } from "../../js/types";
import { batch } from "react-redux";

const BANDS: Slider[] = [
  "preamp",
  60,
  170,
  310,
  600,
  1000,
  3000,
  6000,
  12000,
  14000,
  16000,
];

function activateId(id: string) {
  document.getElementById(id)!.classList.add("active");
}

function deactivateId(id: string) {
  document.getElementById(id)!.classList.remove("active");
}

function hoverPlButton(id: string, i: number) {
  const elements = document.querySelector(id)!.childNodes;
  // @ts-ignore
  elements[i]!.classList.add("hover");
}

function unhoverPlButton(id: string, i: number) {
  const elements = document.querySelector(id)!.childNodes;
  // @ts-ignore
  elements[i]!.classList.remove("hover");
}

function handleBeat(beat: number) {
  switch (beat) {
    case 1:
      activateId("previous");
      break;
    case 2:
      deactivateId("previous");
      activateId("play");
      break;
    case 3:
      deactivateId("play");
      activateId("pause");
      break;
    case 4:
      deactivateId("pause");
      activateId("stop");
      break;
    case 5:
      deactivateId("stop");
      activateId("next");
      break;
    case 6:
      deactivateId("next");
      activateId("eject");
      break;
    case 7:
      deactivateId("eject");
      activateId("shuffle");
      break;
    case 8:
      deactivateId("shuffle");
      activateId("repeat");
      break;
    case 17:
      document.getElementById("playlist-add-menu")!.click();
      break;
    // TODO: Triplet?
    case 18: {
      hoverPlButton("#playlist-add-menu ul", 2);
      break;
    }
    case 19:
      unhoverPlButton("#playlist-add-menu ul", 2);
      hoverPlButton("#playlist-add-menu ul", 1);
      break;

    case 20:
      unhoverPlButton("#playlist-add-menu ul", 1);
      hoverPlButton("#playlist-add-menu ul", 0);
      break;

    case 21:
      unhoverPlButton("#playlist-add-menu ul", 0);
      document.getElementById("playlist-add-menu")!.click();
      document.getElementById("playlist-remove-menu")!.click();
      break;
    case 22:
      hoverPlButton("#playlist-remove-menu ul", 3);
      break;
    case 23:
      unhoverPlButton("#playlist-remove-menu ul", 3);
      hoverPlButton("#playlist-remove-menu ul", 2);
      break;

    case 24:
      unhoverPlButton("#playlist-remove-menu ul", 2);
      hoverPlButton("#playlist-remove-menu ul", 1);
      break;
    case 25:
      unhoverPlButton("#playlist-remove-menu ul", 1);
      hoverPlButton("#playlist-remove-menu ul", 0);
      break;
    case 26:
      hoverPlButton("#playlist-remove-menu ul", 0);
      document.getElementById("playlist-remove-menu ul")!.click();
      break;
  }
}
export function choreograph(webamp: Webamp) {
  let frameNum = 0;
  let lastBeat = 16;
  function tick() {
    frameNum += 1;
    const beat = Math.floor(frameNum / 30);
    if (beat !== lastBeat) {
      lastBeat = beat;
      handleBeat(beat);
    }
    if (beat > 8 && beat <= 16) {
      batch(() => {
        for (const [i, band] of BANDS.entries()) {
          const value = (Math.sin(i + frameNum / 60) + 1) * 50;
          webamp.store.dispatch({ type: "SET_BAND_VALUE", band, value });
        }
      });
    }
    window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);
}
