import React from "react";
import { connect } from "react-redux";
import screenfull from "screenfull";

const USER_PRESET_TRANSITION_SECONDS = 5.7;
const PRESET_TRANSITION_SECONDS = 2.7;
const MILLISECONDS_BETWEEN_PRESET_TRANSITIONS = 15000;

class MilkdropWindow extends React.Component {
  constructor(props) {
    super(props);
    this._handleKeyboardInput = this._handleKeyboardInput.bind(this);
  }
  componentDidMount() {
    require.ensure(
      [
        "butterchurn",
        "butterchurn-presets/presets/converted/Geiss - Reaction Diffusion 2.json"
      ],
      require => {
        const analyserNode = this.props.analyser;
        const butterchurn = require("butterchurn");
        const reactionDiffusion2 = require("butterchurn-presets/presets/converted/Geiss - Reaction Diffusion 2.json");

        this.visualizer = butterchurn.createVisualizer(
          analyserNode.context,
          this._canvasNode,
          {
            width: this._canvasNode.width,
            height: this._canvasNode.height,
            pixelRatio: window.devicePixelRatio || 1
          }
        );
        this.visualizer.connectAudio(analyserNode);
        this.visualizer.loadPreset(reactionDiffusion2, 0);
        // Kick off the animation loop
        const loop = () => {
          if (this.props.status === "PLAYING") {
            this.visualizer.render();
          }
          window.requestAnimationFrame(loop);
        };
        loop();
      },
      e => {
        console.error("Error loading Butterchurn", e);
      },
      "butterchurn"
    );

    require.ensure(
      ["butterchurn-presets"],
      require => {
        const butterchurnPresets = require("butterchurn-presets");
        this.presets = butterchurnPresets.getPresets();
        this.presetKeys = Object.keys(this.presets);
        this.presetHistory = [];
        this.presetRandomize = true;
        this.presetCycle = true;
        this._restartCycling();
        document.addEventListener("keydown", this._handleKeyboardInput);
      },
      e => {
        console.error("Error loading Butterchurn presets", e);
      },
      "butterchurn-presets"
    );
  }
  componentWillUnmount() {
    this._pauseViz();
    this._stopCycling();
    document.removeEventListener("keydown", this._handleKeyboardInput);
  }
  componentDidUpdate(prevProps) {
    if (
      this.props.width !== prevProps.width ||
      this.props.height !== prevProps.height
    ) {
      this._setRendererSize(this.props.width, this.props.height);
    }
  }
  _pauseViz() {
    if (this.animationFrameRequest) {
      window.cancelAnimationFrame(this.animationFrameRequest);
      this.animationFrameRequest = null;
    }
  }
  _stopCycling() {
    if (this.cycleInterval) {
      clearInterval(this.cycleInterval);
      this.cycleInterval = null;
    }
  }
  _restartCycling() {
    this._stopCycling();

    if (this.presetCycle) {
      this.cycleInterval = setInterval(() => {
        this._nextPreset(PRESET_TRANSITION_SECONDS);
      }, MILLISECONDS_BETWEEN_PRESET_TRANSITIONS);
    }
  }
  _setRendererSize(width, height) {
    this._canvasNode.width = width;
    this._canvasNode.height = height;
    // It's possible that the visualizer has not been intialized yet.
    if (this.visualizer != null) {
      this.visualizer.setRendererSize(width, height);
    }
  }
  _handleRequestFullsceen() {
    if (screenfull.enabled) {
      if (!screenfull.isFullscreen) {
        screenfull.request(this._canvasNode);
        this._setRendererSize(window.innerWidth, window.innerHeight);
      } else {
        screenfull.exit();
        this._setRendererSize(this.props.width, this.props.height);
      }
    }
  }
  _handleKeyboardInput(e) {
    switch (e.keyCode) {
      case 32: // spacebar
        this._nextPreset(USER_PRESET_TRANSITION_SECONDS);
        break;
      case 8: // backspace
        this._prevPreset(0);
        break;
      case 72: // H
        this._nextPreset(0);
        break;
      case 82: // R
        this.presetRandomize = !this.presetRandomize;
        break;
      case 145: // scroll lock
      case 125: // F14 (scroll lock for OS X)
        this.presetCycle = !this.presetCycle;
        this._restartCycling();
        break;
    }
  }
  _nextPreset(blendTime) {
    // The visualizer may not have initialized yet.
    if (this.visualizer != null) {
      let presetIdx;
      if (this.presetRandomize || this.presetHistory.length === 0) {
        presetIdx = Math.floor(this.presetKeys.length * Math.random());
      } else {
        const prevPresetIdx = this.presetHistory[this.presetHistory.length - 1];
        presetIdx = (prevPresetIdx + 1) % this.presetKeys.length;
      }
      const preset = this.presets[this.presetKeys[presetIdx]];
      this.presetHistory.push(presetIdx);
      this.visualizer.loadPreset(preset, blendTime);
      this._restartCycling();
    }
  }
  _prevPreset(blendTime) {
    if (this.presetHistory.length > 1 && this.visualizer != null) {
      this.presetHistory.pop();
      this.visualizer.loadPreset(
        this.presets[
          this.presetKeys[this.presetHistory[this.presetHistory.length - 1]]
        ],
        blendTime
      );
      this._restartCycling();
    }
  }
  render() {
    return (
      <canvas
        className="draggable"
        ref={node => (this._canvasNode = node)}
        onDoubleClick={() => this._handleRequestFullsceen()}
        style={{
          // This color will be used until Butterchurn is loaded
          backgroundColor: "#000",
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          height: "100%",
          width: "100%"
        }}
      />
    );
  }
}

const mapStateToProps = state => ({
  status: state.media.status
});

export default connect(mapStateToProps)(MilkdropWindow);
