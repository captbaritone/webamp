import UI_ROOT from "../../UIRoot";
import { removeAllChildNodes } from "../../utils";
// import { Emitter } from "../../utils";
// import AUDIO_PLAYER from "../AudioPlayer";
// import BaseObject from "./BaseObject";
import GuiObj from "./GuiObj";

export default class PlayListGui extends GuiObj {
  static GUID = "pl";
  static guid = "{45F3F7C1-A6F3-4EE6-A15E-125E92FC3F8D}";
  _selectedIndex: number = -1;
  _scrollbar: HTMLDivElement = document.createElement("div");

  getElTag(): string {
    return "group";
  }

  init() {
    super.init();

    UI_ROOT.playlist.on("trackchange", this.refresh);
  }

  // experimental, brutal, just to see reflection of PlayList changes
  refresh = () => {
    removeAllChildNodes(this._div);
    this._div.appendChild(this._scrollbar);
    const pl = UI_ROOT.playlist;
    const currentTrack = pl.getcurrentindex();
    for (let i = 0; i < pl.getnumtracks(); i++) {
      const line = document.createElement("div");
      if (i == currentTrack) {
        line.classList.add("current");
      }
      if (i == this._selectedIndex) {
        line.classList.add("selected");
      }
      line.addEventListener("click", (ev: MouseEvent) => {
        this._selectedIndex = i;
        this.refresh();
      });
      line.addEventListener("dblclick", (ev: MouseEvent) => {
        // this._selectedIndex = i;
        UI_ROOT.playlist.playtrack(i);
        this.refresh();
      });
      line.textContent = pl.gettitle(i);
      this._div.appendChild(line);
    }
  };

  itemClick = () => {};

  draw() {
    super.draw();

    this._scrollbar.classList.add('scrollbar')
    this._div.setAttribute("tabindex", "0");
    this._div.classList.add("pl");
    this._div.classList.add("list");
  }
}
