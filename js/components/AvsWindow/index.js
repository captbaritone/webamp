import React from "react";
import Webvs from "webvs";
import DropTarget from "../DropTarget";
import { genTextFromFileReference } from "../../fileUtils";

import jelloCubePreset from "./jelloCubePreset";

class AvsWindow extends React.PureComponent {
  constructor() {
    super();
    this._handleDrop = this._handleDrop.bind(this);
  }
  componentDidMount() {
    const analyserNode = this.props.analyser;
    const analyser = new Webvs.WebAudioAnalyser({
      context: analyserNode.context
    });
    analyser.connectToNode(analyserNode);
    this._webvsMain = new Webvs.Main({
      canvas: this._canvasNode,
      analyser: analyser
    });
    this._loadPreset(jelloCubePreset);
    this._webvsMain.start();
  }
  componentWillUnmount() {
    // TODO: Dispose?
  }
  componentDidUpdate() {
    // TODO: Consider debouncing
    this._webvsMain.notifyResize();
  }
  _loadPreset(preset) {
    this._webvsMain.loadPreset(preset);
  }
  async _handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) {
      return;
    }
    const json = await genTextFromFileReference(file);
    let preset;
    try {
      preset = JSON.parse(json);
    } catch (err) {
      console.warn("Error parsing AVS preset JSON:", json);
    }
    this._loadPreset(preset);
  }
  render() {
    return (
      <DropTarget handleDrop={this._handleDrop}>
        <canvas
          className="draggable"
          ref={node => (this._canvasNode = node)}
          height={`${this.props.height * 2}px`}
          width={`${this.props.width * 2}px`}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            height: this.props.height,
            width: this.props.width
          }}
        />
      </DropTarget>
    );
  }
}

export default AvsWindow;
