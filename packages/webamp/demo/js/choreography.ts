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
export function choreograph(webamp: Webamp) {
  let frameNum = 0;
  function tick() {
    frameNum += 1;
    batch(() => {
      for (const [i, band] of BANDS.entries()) {
        const value = (Math.sin(i + frameNum / 60) + 1) * 50;
        webamp.store.dispatch({ type: "SET_BAND_VALUE", band, value });
      }
    });
    if (frameNum === 200 || frameNum === 400) {
      document.getElementById("previous")?.classList.add("active");
      document.getElementById("playlist-add-menu")?.click();
      document
        .querySelector("#playlist-add-menu ul")
        .firstChild.classList.add("hover");
    }
    if (frameNum === 400 || frameNum === 600) {
      document.getElementById("playlist-remove-menu")?.click();
    }
    if (frameNum === 600 || frameNum === 800) {
      document.getElementById("playlist-selection-menu")?.click();
    }
    if (frameNum === 800 || frameNum === 1000) {
      document.getElementById("playlist-misc-menu")?.click();
    }
    if (frameNum === 1000 || frameNum === 1200) {
      document.getElementById("playlist-list-menu")?.click();
    }
    window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);
}
