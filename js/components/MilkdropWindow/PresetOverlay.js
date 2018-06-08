import React from "react";

class PresetOverlay extends React.Component {
  constructor(props) {
    super(props);
    this.state = { presetIdx: Math.max(props.currentPreset, 0) };
    this._handleFocusedKeyboardInput = this._handleFocusedKeyboardInput.bind(
      this
    );
  }
  componentDidMount() {
    this._unsubscribeFocusedKeyDown = this.props.onFocusedKeyDown(
      this._handleFocusedKeyboardInput
    );
  }
  componentWillUnmount() {
    if (this._unsubscribeFocusedKeyDown) {
      this._unsubscribeFocusedKeyDown();
    }
  }
  _handleFocusedKeyboardInput(e) {
    switch (e.keyCode) {
      case 38: // up arrow
        this.setState({ presetIdx: Math.max(this.state.presetIdx - 1, 0) });
        e.stopPropagation();
        break;
      case 40: // down arrow
        this.setState({
          presetIdx: Math.min(
            this.state.presetIdx + 1,
            this.props.presetKeys.length - 1
          )
        });
        e.stopPropagation();
        break;
      case 13: // enter
        this.props.selectPreset(this.state.presetIdx);
        e.stopPropagation();
        break;
      case 27: // escape
        this.props.closeOverlay();
        e.stopPropagation();
        break;
    }
  }
  render() {
    if (!this.props.presetKeys) {
      return (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            color: "white",
            background: "rgba(0.33, 0.33, 0.33, 0.33)"
          }}
        >
          <span>Loading presets</span>
        </div>
      );
    }

    // display highlighted preset in the middle if possible
    const numPresets = this.props.presetKeys.length;
    let presetListLen = Math.floor(this.props.height / 20);
    presetListLen = Math.min(Math.max(presetListLen, 3), numPresets);
    presetListLen = presetListLen % 2 ? presetListLen : presetListLen - 1;
    const halfPresetListLen = Math.floor(presetListLen / 2);
    let startIdx = Math.max(this.state.presetIdx - halfPresetListLen, 0);
    let endIdx = Math.min(startIdx + presetListLen, numPresets);
    if (endIdx >= numPresets) {
      startIdx = Math.max(endIdx - presetListLen, 0);
      endIdx = Math.min(startIdx + presetListLen, numPresets);
    }
    const presets = this.props.presetKeys.slice(startIdx, endIdx);
    const presetElms = presets.map((presetName, i) => {
      let color;
      if (i + startIdx === this.props.currentPreset) {
        if (i + startIdx === this.state.presetIdx) {
          color = "#FFCC22";
        } else {
          color = "#CCFF03";
        }
      } else if (i + startIdx === this.state.presetIdx) {
        color = "#FF5050";
      } else {
        color = "#CCCCCC";
      }
      return (
        <li key={i} style={{ color }}>
          {presetName}
        </li>
      );
    });

    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          padding: "15px 10px 0 10px"
        }}
      >
        <div
          style={{
            display: "inline-block",
            width: `${this.props.width - 20}px`,
            maxHeight: `${this.props.height - 15}px`,
            whiteSpace: "nowrap",
            overflow: "hidden",
            background: "rgba(0, 0, 0, 0.815)",
            fontSize: "12px"
          }}
        >
          <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
            {presetElms}
          </ul>
        </div>
      </div>
    );
  }
}

export default PresetOverlay;
