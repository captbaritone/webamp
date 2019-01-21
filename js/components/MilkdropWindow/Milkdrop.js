import React from "react";
import { connect } from "react-redux";
import * as Selectors from "../../selectors";
import DropTarget from "../DropTarget";
import PresetOverlay from "./PresetOverlay";

const USER_PRESET_TRANSITION_SECONDS = 5.7;
const PRESET_TRANSITION_SECONDS = 2.7;
const MILLISECONDS_BETWEEN_PRESET_TRANSITIONS = 15000;

class Milkdrop extends React.Component {
  constructor(props) {
    super(props);
    this.__debugState = "CONSTRUCTED";
    this.__updates = 0;
    this.state = {
      isFullscreen: false,
      presetOverlay: false
    };
  }

  async componentDidMount() {
    this._initializeIfNeeded();
  }

  async _initializeIfNeeded() {
    if (this.visualizer || !this.props.butterchurn || !this.props.presets) {
      return;
    }
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
    if (this.visualizer == null) {
      // https://github.com/captbaritone/webamp/issues/731
      throw new Error("Visualizer not initialized. WAT.");
    }
    this.__debugState = "VISUALIZER_CREATED";
    this.visualizer.connectAudio(this.props.analyser);
    this.presetCycle = true;
    this.selectPreset(this.props.presets.getCurrent(), 0);

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
    if (this.visualizer == null) {
      // https://github.com/captbaritone/webamp/issues/731
      throw new Error("Visualizer not initialized after await. WAT.");
    }
    this.__debugState = "MOUNT_ENDED";
  }

  componentWillUnmount() {
    this.__debugState = "WILL_UNMOUNT";
    this._pauseViz();
    this._stopCycling();
    if (this._unsubscribeFocusedKeyDown) {
      this._unsubscribeFocusedKeyDown();
    }
  }

  componentDidUpdate(prevProps) {
    this._initializeIfNeeded();
    if (
      this.props.width !== prevProps.width ||
      this.props.height !== prevProps.height
    ) {
      this.visualizer.setRendererSize(this.props.width, this.props.height);
    }

    if (this.props.trackTitle !== prevProps.trackTitle) {
      this.visualizer.launchSongTitleAnim(this.props.trackTitle);
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

  _handleFocusedKeyboardInput = e => {
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
      case 84: // T
        this.visualizer.launchSongTitleAnim(this.props.trackTitle);
        e.stopPropagation();
        break;
      case 145: // scroll lock
      case 125: // F14 (scroll lock for OS X)
        this.presetCycle = !this.presetCycle;
        this._restartCycling();
        break;
    }
  };

  _addNewPresets(files) {
    const presetKeys = this.props.presets.getKeys();
    const presets = {};
    const presetIndices = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name;
      const presetName = fileName.substring(fileName, fileName.length - 5); // remove .milk
      const presetIdx = presetKeys.indexOf(presetName);
      if (presetIdx >= 0) {
        presetIndices.push(presetIdx);
      } else {
        presets[presetName] = { file };
      }
    }

    if (Object.keys(presets).length > 0) {
      const filePresetIndices = this.props.presets.addPresets(presets);
      for (let j = filePresetIndices[0]; j < filePresetIndices[1]; j++) {
        presetIndices.push(j);
      }
    }

    return presetIndices;
  }

  async _handleDrop(e) {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const milkFiles = Array.from(files).filter(file =>
        file.name.endsWith(".milk")
      );
      if (milkFiles.length === 0) {
        alert("Visualizer only supports .milk files");
        return;
      }

      const presetIndices = this._addNewPresets(milkFiles);
      this.selectPreset(
        await this.props.presets.selectIndex(presetIndices[0]),
        PRESET_TRANSITION_SECONDS
      );
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

  async loadPresets(presetFiles) {
    const presets = {};
    const milkFiles = Array.from(presetFiles).filter(file =>
      file.name.endsWith(".milk")
    );
    for (let i = 0; i < milkFiles.length; i++) {
      const file = milkFiles[i];
      presets[file.name] = { file };
    }
    const numPresets = this.props.presets.loadPresets(presets);
    this.selectPreset(
      await this.props.presets.selectIndex(
        Math.floor(Math.random() * numPresets)
      ),
      PRESET_TRANSITION_SECONDS
    );
  }

  closePresetOverlay() {
    this.setState({ presetOverlay: false });
  }

  render() {
    if (this.props.presets == null) {
      return null;
    }
    return (
      <DropTarget id="milkdrop-window" handleDrop={e => this._handleDrop(e)}>
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
            loadPresets={async presetFiles => this.loadPresets(presetFiles)}
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
      </DropTarget>
    );
  }
}

const mapStateToProps = state => ({
  trackTitle: Selectors.getCurrentTrackDisplayName(state),
  presets: Selectors.getPresets(state),
  butterchurn: Selectors.getButterchurn(state)
});

export default connect(mapStateToProps)(Milkdrop);
