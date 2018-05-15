import React from "react";
import screenfull from "screenfull";

const PRESET_TRANSITION_SECONDS = 2.7;
const MILLISECONDS_BETWEEN_PRESET_TRANSITIONS = 15000;

class MilkdropWindow extends React.Component {
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
        this._renderViz();
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
        const presets = butterchurnPresets.getPresets();
        const presetKeys = Object.keys(presets);
        this.cycleInterval = setInterval(() => {
          const presetIdx = Math.floor(presetKeys.length * Math.random());
          const preset = presets[presetKeys[presetIdx]];
          // The visualizer may not have initialized yet.
          if (this.visualizer != null) {
            this.visualizer.loadPreset(preset, PRESET_TRANSITION_SECONDS);
          }
        }, MILLISECONDS_BETWEEN_PRESET_TRANSITIONS);
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
  }
  componentDidUpdate(prevProps) {
    if (
      this.props.width !== prevProps.width ||
      this.props.height !== prevProps.height
    ) {
      this._setRendererSize(this.props.width, this.props.height);
    }
  }
  _renderViz() {
    this.animationFrameRequest = requestAnimationFrame(() => this._renderViz());
    this.visualizer.render();
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

export default MilkdropWindow;
