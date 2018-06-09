import React from "react";
import { connect } from "react-redux";
import screenfull from "screenfull";
import PresetOverlay from "./PresetOverlay";

const USER_PRESET_TRANSITION_SECONDS = 5.7;
const PRESET_TRANSITION_SECONDS = 2.7;
const MILLISECONDS_BETWEEN_PRESET_TRANSITIONS = 15000;

class MilkdropWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFullscreen: false,
      presetOverlay: false,
      currentPreset: -1
    };
    this._handleFocusedKeyboardInput = this._handleFocusedKeyboardInput.bind(
      this
    );
    this._handleFullscreenChange = this._handleFullscreenChange.bind(this);
  }
  componentDidMount() {
    require.ensure(
      [
        "butterchurn",
        "butterchurn-presets/lib/butterchurnPresetsMinimal.min",
        "butterchurn-presets/lib/butterchurnPresetPackMeta.min"
      ],
      require => {
        const analyserNode = this.props.analyser;
        const butterchurn = require("butterchurn");
        const butterchurnMinimalPresets = require("butterchurn-presets/lib/butterchurnPresetsMinimal.min");
        const presetPackMeta = require("butterchurn-presets/lib/butterchurnPresetPackMeta.min");
        this.presets = butterchurnMinimalPresets.getPresets();
        this.minmalPresetKeys = Object.keys(this.presets);
        this.presetKeys = presetPackMeta.getMainPresetMeta().presets;
        const presetKey = this.minmalPresetKeys[
          Math.floor(Math.random() * this.minmalPresetKeys.length)
        ];

        this.visualizer = butterchurn.createVisualizer(
          analyserNode.context,
          this._canvasNode,
          {
            width: this.props.width,
            height: this.props.height,
            pixelRatio: window.devicePixelRatio || 1
          }
        );
        this._canvasNode.width = this.props.width;
        this._canvasNode.height = this.props.height;
        this.visualizer.connectAudio(analyserNode);
        this.visualizer.loadPreset(this.presets[presetKey], 0);
        // Kick off the animation loop
        const loop = () => {
          if (this.props.status === "PLAYING") {
            this.visualizer.render();
          }
          window.requestAnimationFrame(loop);
        };
        loop();

        const presetIdx = this.presetKeys.indexOf(presetKey);
        this.presetHistory = [presetIdx];
        this.presetRandomize = true;
        this.presetCycle = true;
        this._restartCycling();
        this._unsubscribeFocusedKeyDown = this.props.onFocusedKeyDown(
          this._handleFocusedKeyboardInput
        );
        this.setState({ currentPreset: presetIdx });
      },
      e => {
        console.error("Error loading Butterchurn", e);
      },
      "butterchurn"
    );
  }
  componentWillUnmount() {
    this._pauseViz();
    this._stopCycling();
    if (this._unsubscribeFocusedKeyDown) {
      this._unsubscribeFocusedKeyDown();
    }
    screenfull.off("change", this._handleFullscreenChange);
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
  _handleFullscreenChange() {
    if (screenfull.isFullscreen) {
      this._setRendererSize(window.innerWidth, window.innerHeight);
    } else {
      this._setRendererSize(this.props.width, this.props.height);
    }
    this.setState({ isFullscreen: screenfull.isFullscreen });
  }
  _handleRequestFullsceen() {
    if (screenfull.enabled) {
      if (!screenfull.isFullscreen) {
        screenfull.request(this._wrapperNode);
      } else {
        screenfull.exit();
      }
    }
  }
  _handleFocusedKeyboardInput(e) {
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
      case 76: // L
        this.setState({ presetOverlay: !this.state.presetOverlay });
        e.stopPropagation();
        break;
      case 145: // scroll lock
      case 125: // F14 (scroll lock for OS X)
        this.presetCycle = !this.presetCycle;
        this._restartCycling();
        break;
    }
  }
  async _loadMainPresetPack() {
    this.loadingPresets = true;
    return require.ensure(
      ["butterchurn-presets/lib/butterchurnPresetsNonMinimal.min"],
      require => {
        const butterchurnNonMinimalPresets = require("butterchurn-presets/lib/butterchurnPresetsNonMinimal.min");
        Object.assign(this.presets, butterchurnNonMinimalPresets.getPresets());
        this.loadingPresets = false;
      },
      e => {
        console.error("Error loading Butterchurn Presets", e);
      },
      "butterchurn-presets"
    );
  }
  async _nextPreset(blendTime) {
    // The visualizer may not have initialized yet.
    if (this.visualizer != null) {
      let presetIdx;
      if (this.presetRandomize || this.presetHistory.length === 0) {
        presetIdx = Math.floor(this.presetKeys.length * Math.random());
      } else {
        const prevPresetIdx = this.presetHistory[this.presetHistory.length - 1];
        presetIdx = (prevPresetIdx + 1) % this.presetKeys.length;
      }
      this.selectPreset(presetIdx, blendTime);
    }
  }
  _prevPreset(blendTime) {
    if (this.loadingPresets && this.presetQueue.length > 1) {
      this.presetQueue.pop();
      return;
    }

    if (this.presetHistory.length > 1 && this.visualizer != null) {
      this.presetHistory.pop();
      const prevPreset = this.presetHistory[this.presetHistory.length - 1];
      this.visualizer.loadPreset(
        this.presets[this.presetKeys[prevPreset]],
        blendTime
      );
      this._restartCycling();
      this.setState({ currentPreset: prevPreset });
    }
  }
  async selectPreset(presetIdx, blendTime) {
    if (this.loadingPresets) {
      this.presetQueue.push(presetIdx);
      return;
    }

    let preset = this.presets[this.presetKeys[presetIdx]];
    let selectedIdx;
    if (!preset) {
      this.presetQueue = [presetIdx];
      await this._loadMainPresetPack();
      if (this.presetQueue.length === 0) {
        return;
      }
      selectedIdx = this.presetQueue[this.presetQueue.length - 1];
      preset = this.presets[this.presetKeys[selectedIdx]];
      this.presetHistory = this.presetHistory.concat(this.presetQueue);
    } else {
      selectedIdx = presetIdx;
      this.presetHistory.push(selectedIdx);
    }
    this.visualizer.loadPreset(preset, blendTime);
    this._restartCycling();
    this.setState({ currentPreset: selectedIdx });
  }
  closePresetOverlay() {
    this.setState({ presetOverlay: false });
  }
  render() {
    const width = this.state.isFullscreen
      ? window.innerWidth
      : this.props.width;
    const height = this.state.isFullscreen
      ? window.innerHeight
      : this.props.height;
    return (
      <div
        className="draggable"
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
        tabIndex="0"
        ref={node => (this._wrapperNode = node)}
        onDoubleClick={() => this._handleRequestFullsceen()}
      >
        {this.state.presetOverlay && (
          <PresetOverlay
            width={width}
            height={height}
            presetKeys={this.presetKeys}
            currentPreset={this.state.currentPreset}
            onFocusedKeyDown={listener => this.props.onFocusedKeyDown(listener)}
            selectPreset={idx => this.selectPreset(idx, 0)}
            closeOverlay={() => this.closePresetOverlay()}
          />
        )}
        <canvas
          style={{
            height: "100%",
            width: "100%"
          }}
          ref={node => (this._canvasNode = node)}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  status: state.media.status
});

export default connect(mapStateToProps)(MilkdropWindow);
