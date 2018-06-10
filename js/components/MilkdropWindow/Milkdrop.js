import React from "react";
import screenfull from "screenfull";
import PresetOverlay from "./PresetOverlay";
import Background from "./Background";

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
    this._handleFullscreenChange = this._handleFullscreenChange.bind(this);
  }

  async componentDidMount() {
    this.setState({ currentPreset: this.props.presets.getCurrentIndex() });
    this.visualizer = this.props.butterchurn.createVisualizer(
      this.props.analyser.context,
      this._canvasNode,
      {
        width: this.props.width,
        height: this.props.height,
        pixelRatio: window.devicePixelRatio || 1
      }
    );
    this._setRendererSize(this.props.width, this.props.height);

    this.visualizer.connectAudio(this.props.analyser);

    // Kick off the animation loop
    const loop = () => {
      if (this.props.playing) {
        this.visualizer.render();
      }
      this._animationFrameRequest = window.requestAnimationFrame(loop);
    };
    loop();

    this.presetCycle = true;
    this._unsubscribeFocusedKeyDown = this.props.onFocusedKeyDown(
      this._handleFocusedKeyboardInput
    );
    screenfull.onchange(this._handleFullscreenChange);
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

  _setRendererSize(width, height) {
    this._canvasNode.width = width;
    this._canvasNode.height = height;
    this.visualizer.setRendererSize(width, height);
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
      this.setState({ currentPreset: this.props.presets.getCurrentIndex() });
    }
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
      <Background
        innerRef={node => (this._wrapperNode = node)}
        onDoubleClick={() => this._handleRequestFullsceen()}
      >
        {this.state.presetOverlay && (
          <PresetOverlay
            width={width}
            height={height}
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
          style={{
            height: "100%",
            width: "100%"
          }}
          ref={node => (this._canvasNode = node)}
        />
      </Background>
    );
  }
}
