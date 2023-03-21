import { UIRoot } from "../../UIRoot";
import { VisPaintHandler, registerPainter } from "./Vis";
import Vis from "./Vis";
import butterchurn from "butterchurn";
import butterchurnPresets from "butterchurn-presets";
import { AUDIO_PLAYING } from "../AudioPlayer";
import { circular, clamp, debounce } from "../../utils";
import GuiObj from "./GuiObj";

export default class Avs extends Vis {
  static GUID = "OFFICIALLY-NO-GUID";
  // static GUID = "0000000a0010000c01017bff0c456342";

  init() {
    this._mode = "milkdrop";
    super.init();
    this._uiRoot._avss.push(this);
  }

  handleAction(
    action: string,
    param: string | null = null,
    actionTarget: string | null = null,
    source: GuiObj = null
  ): boolean {
    action = action.toLowerCase();
    if (["vis_prev", "vis_next", "vis_f5"].includes(action)) {
      this._painter.doAction(action, param);
      return true;
    }
    return false;
  }
}

//? =============================== OSCILOSCOPE PAINTER ===============================

class ButterchurnPaintHandler extends VisPaintHandler {
  _analyser: AnalyserNode;
  _visualizer: ReturnType<butterchurn.createVisualizer> = null;
  _presetIndex: number = 10;

  // constructor(vis: Vis) {
  //   super(vis);
  // }
  prepare() {
    // this._visualizer = null; //destroy. is it okay by just set null?
  }

  _buildButterchurn() {
    const audio = this._vis._uiRoot.audio;

    // const audioContext = new AudioContext();
    const canvas = this._vis._canvas;
    const width = canvas.width;
    const height = canvas.height;
    // const width = 400;
    // const height = 300;
    this._visualizer = butterchurn.createVisualizer(audio._context, canvas, {
      width /* : canvas.width */,
      height /* : canvas.height */,
    });
    this._visualizer.connectAudio(audio._analyser);

    this._visualizer.setRendererSize(width, height);

    // load a preset
    this.loadPreset();
    // const presets = butterchurnPresets.getPresets();
    // const preset = presets['Flexi, martin + geiss - dedicated to the sherwin maxawow'];
    // this._visualizer.loadPreset(preset, 0.0); // 2nd argument is the number of seconds to blend presets

    // this._visualizer.connectAudio(audio._analyser)
  }

  paintFrame() {
    if (!this._visualizer) {
      if (!document.getElementById(this._vis._canvas.id)) return;
      if (!(this._vis._uiRoot.audio.getState() == AUDIO_PLAYING)) return;
      this._buildButterchurn();
    }
    this._visualizer.render();

    // const ctx = this._vis._canvas.getContext('2d');
    // ctx.fillText(String(this._presetIndex), 30, 30)
  }

  /**
   * called if it is an AVS.
   * @param action vis_prev | vis_next | vis_f5 (fullscreen) |
   */
  doAction(action: string, param: string) {
    switch (action) {
      case "vis_prev":
        this._presetIndex--;
        this.loadPreset();
        break;
      case "vis_next":
        this._presetIndex++;
        this.loadPreset();
        break;
      case "vis_f5":
        break;
    }
  }

  // please call after set the `presetIndex`
  loadPreset() {
    if (!this._visualizer) return;
    const presets = butterchurnPresets.getPresets();
    const presetNames = Object.keys(presets);
    this._presetIndex = circular(this._presetIndex, 0, presetNames.length - 1);
    const presetName =
      this._presetIndex == 0
        ? "Flexi, martin + geiss - dedicated to the sherwin maxawow"
        : presetNames[this._presetIndex];
    const preset = presets[presetName];

    this._visualizer.loadPreset(preset, 1); // 2nd argument is the number of seconds to blend presets

    //somehow, not switched to other preset.
    //below is a bad hack to fishing the changes
    // const audio = this._vis._uiRoot.audio;
    // this._visualizer.disconnectAudio(audio._analyser)
    // this._visualizer.connectAudio(audio._analyser)

    const canvas = this._vis._canvas;
    const bound = canvas.getBoundingClientRect();
    const width = Math.max(bound.width, 10);
    const height = Math.max(bound.height, 10);
    canvas.width = width;
    canvas.height = height;
    this._visualizer.setRendererSize(width, height);
    this._visualizer.launchSongTitleAnim(
      `Preset:[${this._presetIndex}] : ${presetName}`
    );
    this._visualizer.renderer.supertext.duration = 7;
    this._visualizer.render();
  }
}
registerPainter("milkdrop", ButterchurnPaintHandler);
