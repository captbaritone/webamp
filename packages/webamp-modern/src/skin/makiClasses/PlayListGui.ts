import UI_ROOT from "../../UIRoot";
import { removeAllChildNodes } from "../../utils";
// import { Emitter } from "../../utils";
// import AUDIO_PLAYER from "../AudioPlayer";
// import BaseObject from "./BaseObject";
import GuiObj from "./GuiObj";

export default class PlayListGui extends GuiObj {
  static GUID = "pl";
  static guid = "{45F3F7C1-A6F3-4EE6-A15E-125E92FC3F8D}";


  getElTag(): string {
    return "group";
  }

  init() {
    super.init()

    UI_ROOT.playlist.on('trackchange', this.refresh)
  }

  // experimental, brutal, just to see reflection of PlayList changes
  refresh = () => {
    removeAllChildNodes(this._div);
    const pl = UI_ROOT.playlist;
    for(let i = 0; i < pl.getnumtracks(); i++){
      const line = document.createElement('div');
      line.textContent = pl.gettitle(i);
      this._div.appendChild(line)
    }
  }

  draw() {
    super.draw()

    this._div.classList.add('pl')
  }
}

