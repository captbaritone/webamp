import React from "react";
import DropTarget from "../DropTarget";
import PresetOverlay from "./PresetOverlay";

const USER_PRESET_TRANSITION_SECONDS = 5.7;
const PRESET_TRANSITION_SECONDS = 2.7;
const MILLISECONDS_BETWEEN_PRESET_TRANSITIONS = 15000;
const CONVERT_URL =
  "https://p2tpeb5v8b.execute-api.us-east-2.amazonaws.com/default/milkdropShaderConverter";

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

  async _convertHLSL(text) {
    if (!text) {
      return "";
    }

    const response = await fetch(CONVERT_URL, {
      method: "POST",
      body: JSON.stringify({
        optimize: false,
        shader: text
      })
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const responseBody = await response.json();
    return responseBody.shader;
  }

  _optimizeShader(milkdropPresetUtils, optimizeGLSL, text) {
    if (text.length === 0) {
      return text;
    }

    let optimizedShader = optimizeGLSL(text);
    optimizedShader = milkdropPresetUtils.processOptimizedShader(
      optimizedShader
    );

    return optimizedShader;
  }

  async _convertShader(milkdropPresetUtils, optimizeGLSL, text) {
    try {
      const shader = milkdropPresetUtils.prepareShader(text);
      const convertedShader = await this._convertHLSL(shader);
      const optimizedShader = this._optimizeShader(
        milkdropPresetUtils,
        optimizeGLSL,
        convertedShader
      );
      return optimizedShader;
    } catch (e) {
      return "";
    }
  }

  async _convertPreset(text) {
    return new Promise((resolve, reject) => {
      require.ensure(
        ["milkdrop-preset-utils", "milkdrop-eel-parser", "glsl-optimizer-js"],
        async require => {
          const milkdropPresetUtils = require("milkdrop-preset-utils");
          const milkdropParser = require("milkdrop-eel-parser");
          const glslOptimizer = require("glsl-optimizer-js");
          const optimizeGLSL = await new Promise(resolveFun => {
            glslOptimizer().then(Module => {
              const optimize = Module.cwrap("optimize_glsl", "string", [
                "string",
                "number",
                "number"
              ]);
              resolveFun(optimize);
            });
          });

          let mainPresetText = text.split("[preset00]")[1];
          mainPresetText = mainPresetText.replace(/\r\n/g, "\n");

          const presetParts = milkdropPresetUtils.splitPreset(mainPresetText);
          const parsedPreset = milkdropParser.convert_preset_wave_and_shape(
            presetParts.presetVersion,
            presetParts.presetInit,
            presetParts.perFrame,
            presetParts.perVertex,
            presetParts.shapes,
            presetParts.waves
          );
          const presetMap = milkdropPresetUtils.createBasePresetFuns(
            parsedPreset,
            presetParts.shapes,
            presetParts.waves
          );

          const [warpShader, compShader] = await Promise.all([
            this._convertShader(
              milkdropPresetUtils,
              optimizeGLSL,
              presetParts.warp
            ),
            this._convertShader(
              milkdropPresetUtils,
              optimizeGLSL,
              presetParts.comp
            )
          ]);

          resolve(
            Object.assign({}, presetMap, {
              baseVals: presetParts.baseVals,
              warp: warpShader,
              comp: compShader
            })
          );
        },
        reject,
        "milkdrop-preset-conversion"
      );
    });
  }

  async _readPresetFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        resolve(e.target.result);
      };
      reader.onerror = function(e) {
        reject(e);
      };

      reader.readAsText(file);
    });
  }

  async _handleDrop(e) {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fileContents = await this._readPresetFile(files[0]);
      const convertedPreset = await this._convertPreset(fileContents);
      this.visualizer.loadPreset(convertedPreset, PRESET_TRANSITION_SECONDS);
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
        <DropTarget id="milkdrop-window" handleDrop={e => this._handleDrop(e)}>
          {this.state.presetOverlay && (
            <PresetOverlay
              width={this.props.width}
              height={this.props.height}
              presetKeys={this.props.presets.getKeys()}
              currentPreset={this.state.currentPreset}
              onFocusedKeyDown={listener =>
                this.props.onFocusedKeyDown(listener)
              }
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
        </DropTarget>
      </React.Fragment>
    );
  }
}
