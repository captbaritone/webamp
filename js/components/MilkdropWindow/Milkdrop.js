import React from "react";
import PresetOverlay from "./PresetOverlay";

const USER_PRESET_TRANSITION_SECONDS = 5.7;
const PRESET_TRANSITION_SECONDS = 2.7;
const MILLISECONDS_BETWEEN_PRESET_TRANSITIONS = 15000;

export default class Milkdrop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFullscreen: false,
      presetOverlay: false
    };
    this._handleFocusedKeyboardInput = this._handleFocusedKeyboardInput.bind(
      this
    );
  }

  async componentDidMount() {
    this.visualizer = this.props.butterchurn.createVisualizer(
      this.props.analyser.context,
      this._canvasNode,
      {
        width: this.props.width,
        height: this.props.height,
        meshWidth: 32,
        meshHeight: 24,
        pixelRatio: window.devicePixelRatio || 1
      }
    );
    this.visualizer.connectAudio(this.props.analyser);
    this.presetCycle = true;
    if (this.props.initialPreset) {
      this.visualizer.loadPreset(this.props.initialPreset, 0);
    } else {
      this.selectPreset(this.props.presets.getCurrent(), 0);
    }

    // Kick off the animation loop
    const loop = () => {
      if (this.props.playing && this.props.isEnabledVisualizer) {
        this.visualizer.render();
      }
      this._animationFrameRequest = window.requestAnimationFrame(loop);
    };
    loop();

    this._unsubscribeFocusedKeyDown = this.props.onFocusedKeyDown(
      this._handleFocusedKeyboardInput
    );
  }

  componentWillUnmount() {
    this._pauseViz();
    this._stopCycling();
    if (this._unsubscribeFocusedKeyDown) {
      this._unsubscribeFocusedKeyDown();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.width !== prevProps.width ||
      this.props.height !== prevProps.height
    ) {
      this.visualizer.setRendererSize(this.props.width, this.props.height);
    }
  }

  _pauseViz() {
    if (this._animationFrameRequest) {
      window.cancelAnimationFrame(this._animationFrameRequest);
      this._animationFrameRequest = null;
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
        this.props.presets.toggleRandomize();
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

  async _nextPreset(blendTime) {
    this.selectPreset(await this.props.presets.next(), blendTime);
  }

  async _prevPreset(blendTime) {
    this.selectPreset(await this.props.presets.previous(), blendTime);
  }

  selectPreset(preset, blendTime = 0) {
    if (preset != null) {
      this.visualizer.loadPreset(preset, blendTime);
      this._restartCycling();
      // TODO: Kinda weird that we use the passed preset for the visualizer,
      // but set state to the current. Maybe we should just always use the curent..
      this.setState({ currentPreset: this.props.presets.getCurrentIndex() });
    }
  }

  closePresetOverlay() {
    this.setState({ presetOverlay: false });
  }

  render() {
    return (
      <React.Fragment>
        {this.state.presetOverlay && (
          <PresetOverlay
            width={this.props.width}
            height={this.props.height}
            presetKeys={this.props.presets.getKeys()}
            currentPreset={this.state.currentPreset}
            onFocusedKeyDown={listener => this.props.onFocusedKeyDown(listener)}
            selectPreset={async idx => {
              this.selectPreset(await this.props.presets.selectIndex(idx), 0);
            }}
            closeOverlay={() => this.closePresetOverlay()}
          />
        )}
        <canvas
          height={this.props.height}
          width={this.props.width}
          style={{
            height: "100%",
            width: "100%",
            display: this.props.isEnabledVisualizer ? "block" : "none"
          }}
          ref={node => (this._canvasNode = node)}
        />
      </React.Fragment>
    );
  }
}
