import UI_ROOT from "../../UIRoot";
import { removeAllChildNodes } from "../../utils";
import Group from "./Group";
// import { Emitter } from "../../utils";
// import AUDIO_PLAYER from "../AudioPlayer";
// import BaseObject from "./BaseObject";
// import GuiObj from "./GuiObj";
import Slider, { ActionHandler } from "./Slider";

export default class PlayListGui extends Group {
  static GUID = "pl";
  static guid = "{45F3F7C1-A6F3-4EE6-A15E-125E92FC3F8D}";
  _selectedIndex: number = -1;
  // _scrollPanel: HTMLDivElement = document.createElement("div");
  _contentPanel: HTMLDivElement = document.createElement("div");
  _slider: Slider = new Slider();
  _sliderHandler: ActionHandler;

  getElTag(): string {
    return "group";
  }

  constructor() {
    super();

    // this._prepareScrollbar();
    // // this._div.appendChild(this._scrollPanel)
    // this._div.appendChild(this._contentPanel);
    // this._scrollPanel.appendChild(this._slider.getDiv());
  }

  init() {
    super.init();
    this._slider._setPositionXY(0, 0);

    UI_ROOT.playlist.on("trackchange", this.refresh);
  }

  _prepareScrollbar() {
    // this._slider = new Slider();
    this._slider.setXmlAttributes({
      orientation: "v",
      x: "-10",
      relatx: "1",
      y: "0",
      w: "8",
      h: "0",
      relath: "1",
    });
    this._slider.setThumbSize(8, 18);
    this._sliderHandler = new PlaylistScrollActionHandler(this._slider, this);
    this._slider.setActionHandler(this._sliderHandler);
    this._slider.getDiv().classList.add("scrollbar");
    // this._scrollPanel.appendChild(this._slider.getDiv());
    this._slider.draw();
    this.addChild(this._slider);

    this._contentPanel.addEventListener("scroll", this._contentScrolled);
  }

  _contentScrolled = () => {
    const list = this._contentPanel;
    const newPercent = (list.scrollTop / (list.scrollHeight - list.clientHeight));
    this._slider.setposition((1-newPercent) * 255);
    console.log(
      newPercent,
      "scrolled",
      list.scrollTop,
      list.clientHeight,
      list.scrollHeight
    );
  };

  // experimental, brutal, just to see reflection of PlayList changes
  refresh = () => {
    removeAllChildNodes(this._contentPanel);
    // this._div.appendChild(this._scrollPanel);
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
      line.textContent = `${i}. ${pl.gettitle(i)}`;
      this._contentPanel.appendChild(line);
    }
  };

  itemClick = () => {};

  draw() {
    super.draw();
    this._prepareScrollbar();
    // this._div.appendChild(this._scrollPanel)
    this._div.appendChild(this._contentPanel);

    // this._scrollPanel.classList.add("scrollbar");
    this._contentPanel.classList.add("content-list");
    this._div.setAttribute("tabindex", "0");
    this._div.classList.add("pl");
    this._div.classList.add("list");
    this._div.style.pointerEvents = "auto";
  }
}

class PlaylistScrollActionHandler extends ActionHandler {
  _pl: PlayListGui;
  constructor(slider: Slider, pl: PlayListGui) {
    super(slider);
    this._pl = pl;
    // const update = () => {
    //   slider._position = UI_ROOT.audio.getEq(kind);
    //   slider._renderThumbPosition();
    // };
    // update();
    // this._subscription = UI_ROOT.audio.onEqChange(kind, update);
  }

  onsetposition(position: number): void {
    // UI_ROOT.audio.setEq(this._kind, position / MAX);
  }
}
