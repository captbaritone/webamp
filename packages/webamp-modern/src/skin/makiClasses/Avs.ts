import { UIRoot } from "../../UIRoot";
import { VisPaintHandler, registerPainter } from "./Vis";
import Vis from "./Vis";
import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';
import { AUDIO_PLAYING } from "../AudioPlayer";
import { debounce } from "../../utils";

export default class Avs extends Vis {
  static GUID = "OFFICIALLY-NO-GUID";
  // static GUID = "0000000a0010000c01017bff0c456342";

  init() {
    this._mode = 'milkdrop';
    super.init();
  }
}


//? =============================== OSCILOSCOPE PAINTER ===============================

class ButterchurnPaintHandler extends VisPaintHandler {
  _analyser: AnalyserNode;
  _visualizer: ReturnType<butterchurn.createVisualizer> = null;


  // constructor(vis: Vis) {
  //   super(vis);
  // }
  prepare() {
    // this._visualizer = null; //destroy. is it okay by just set null?
  }

  _buildButterchurn() {
    const audio = this._vis._uiRoot.audio;

    const audioContext = new AudioContext();
    const canvas = this._vis._canvas;
    const width = 200;
    const height = 200;
    this._visualizer = butterchurn.createVisualizer(audio._context, canvas, {
      /* width: canvas. */width,
      /* height: canvas. */height
    });

    this._visualizer.setRendererSize(width, height);

    // load a preset

    const presets = butterchurnPresets.getPresets();
    const preset = presets['Flexi, martin + geiss - dedicated to the sherwin maxawow'];

    this._visualizer.loadPreset(preset, 0.0); // 2nd argument is the number of seconds to blend presets

    this._visualizer.connectAudio(audio._analyser)
  }

  paintFrame() {
    if (!this._visualizer) {

      if (!document.getElementById(this._vis._canvas.id) )
        return;
      if( ! (this._vis._uiRoot.audio.getState() == AUDIO_PLAYING) )
        return;
      this._buildButterchurn()
    }
    this._visualizer.render()
  }
}
registerPainter('milkdrop', ButterchurnPaintHandler)