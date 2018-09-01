import React from "react";
import update from "immutability-helper";
import { getMenuItem } from "./MenuData";
import TextEditor from "./TextEditor";
import FloatEditor from "./FloatEditor";
import IntEditor from "./IntEditor";

class PresetEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      presetParts: props.currentPreset.presetParts,
      menuIdx: [0],
      menuKey: []
    };
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

  _backToLastMenuItem() {
    this.setState({
      menuKey: this.state.menuKey.splice(0, this.state.menuKey.length - 1),
      menuIdx: this.state.menuIdx.splice(0, this.state.menuIdx.length - 1)
    });
  }

  _handleFocusedKeyboardInput = e => {
    const menuKey = this.state.menuKey;
    const menuItem = getMenuItem(menuKey);
    switch (e.keyCode) {
      case 8: // backspace
        if (menuKey.length > 0) {
          this._backToLastMenuItem();
        }
        e.stopPropagation();
        break;
      case 38: // up arrow
        if (menuItem.items) {
          const menuIdx = this.state.menuIdx.slice();
          menuIdx[menuIdx.length - 1] = Math.max(
            menuIdx[menuIdx.length - 1] - 1,
            0
          );
          this.setState({ menuIdx });
        }
        e.stopPropagation();
        break;
      case 40: // down arrow
        if (menuItem.items) {
          const menuIdx = this.state.menuIdx.slice();
          menuIdx[menuIdx.length - 1] = Math.min(
            menuIdx[menuIdx.length - 1] + 1,
            menuItem.items.length - 1
          );
          this.setState({ menuIdx });
        }
        e.stopPropagation();
        break;
      case 13: // enter
        if (menuItem.items) {
          const currentMenuIdx = this.state.menuIdx[
            this.state.menuIdx.length - 1
          ];
          const selectedItem = menuItem.items[currentMenuIdx];
          if (selectedItem.type === "bool") {
            this._updateValue(
              selectedItem.presetKey,
              this._getValue(selectedItem.presetKey) ? 0 : 1
            );
          } else {
            this.setState({
              menuKey: this.state.menuKey.concat(
                menuItem.items[currentMenuIdx].name
              ),
              menuIdx: this.state.menuIdx.concat(0)
            });
          }
        }
        e.stopPropagation();
        break;
      case 27: // escape
        this.props.closeOverlay();
        e.stopPropagation();
        break;
    }
  };

  _getValue(key) {
    let value = this.state.presetParts;
    for (let i = 0; i < key.length; i++) {
      value = value[key[i]];
    }

    return value;
  }

  async _convertShader(text) {
    const presetConverter = await this.props.loadPresetConverter();
    return presetConverter.convertShader(
      text,
      "https://p2tpeb5v8b.execute-api.us-east-2.amazonaws.com/default/milkdropShaderConverter"
    );
  }

  async _convertPresetEquations(presetVersion, initEQs, frameEQs, pixelEQs) {
    const presetConverter = await this.props.loadPresetConverter();
    return presetConverter.convertPresetEquations(
      presetVersion,
      initEQs,
      frameEQs,
      pixelEQs
    );
  }

  async _convertShapeEquations(presetVersion, initEQs, frameEQs) {
    const presetConverter = await this.props.loadPresetConverter();
    return presetConverter.convertShapeEquations(
      presetVersion,
      initEQs,
      frameEQs
    );
  }

  async _convertWaveEquations(presetVersion, initEQs, frameEQs, pointEQs) {
    const presetConverter = await this.props.loadPresetConverter();
    return presetConverter.convertWaveEquations(
      presetVersion,
      initEQs,
      frameEQs,
      pointEQs
    );
  }

  // Converts presetKey array ["baseVals" "warp"] to query {baseVals: {warp: { $set: value }}}
  _presetKeyArrayToQuery(presetKey, value) {
    return presetKey
      .slice()
      .reverse()
      .reduce((acc, key) => ({ [key]: acc }), { $set: value });
  }

  async _updateValue(key, value) {
    const query = this._presetKeyArrayToQuery(key, value);
    this.setState({ presetParts: update(this.state.presetParts, query) });

    if (key.indexOf("baseVals") !== -1) {
      // can just directly update baseVal in preset and presetParts
      const preset = update(
        this.props.currentPreset,
        Object.assign({}, query, { presetParts: query })
      );
      this.props.updatePreset(preset);
    } else if (key[0] === "warp") {
      const convertedShader = await this._convertShader(value);
      const preset = update(
        this.props.currentPreset,
        Object.assign(
          {},
          { warp: { $set: convertedShader } },
          { presetParts: query }
        )
      );
      this.props.updatePreset(preset);
    } else if (key[0] === "comp") {
      const convertedShader = await this._convertShader(value);
      const preset = update(
        this.props.currentPreset,
        Object.assign(
          {},
          { comp: { $set: convertedShader } },
          { presetParts: query }
        )
      );
      this.props.updatePreset(preset);
    } else if (
      key[0] === "presetInit" ||
      key[0] === "perFrame" ||
      key[0] === "perVertex"
    ) {
      let preset = update(this.props.currentPreset, { presetParts: query });
      const presetEQs = await this._convertPresetEquations(
        preset.presetParts.presetVersion,
        preset.presetParts.presetInit,
        preset.presetParts.perFrame,
        preset.presetParts.perVertex
      );
      preset = Object.assign(preset, presetEQs);
      this.props.updatePreset(preset);
    } else if (key[0] === "shapes") {
      // Shape equations updated (baseVals handled already)
      const preset = update(this.props.currentPreset, { presetParts: query });
      const shapeEQs = await this._convertShapeEquations(
        preset.presetParts.presetVersion,
        preset.presetParts.shapes[key[1]].init_eqs_str,
        preset.presetParts.shapes[key[1]].frame_eqs_str
      );
      preset.shapes[key[1]] = Object.assign(preset.shapes[key[1]], shapeEQs);
      this.props.updatePreset(preset);
    } else if (key[0] === "waves") {
      // Wave equations updated (baseVals handled already)
      const preset = update(this.props.currentPreset, { presetParts: query });
      const waveEQs = await this._convertWaveEquations(
        preset.presetParts.presetVersion,
        preset.presetParts.waves[key[1]].init_eqs_str,
        preset.presetParts.waves[key[1]].frame_eqs_str,
        preset.presetParts.waves[key[1]].point_eqs_str
      );
      preset.waves[key[1]] = Object.assign(preset.waves[key[1]], waveEQs);
      this.props.updatePreset(preset);
    }
  }

  render() {
    if (!this.state.presetParts) {
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
          <span>Cannot edit this preset</span>
        </div>
      );
    }

    const menuItem = getMenuItem(this.state.menuKey);
    let menuItemElms;
    let menuMeta;
    if (menuItem.type) {
      let itemValue = this._getValue(menuItem.presetKey);
      if (itemValue === undefined) {
        itemValue = menuItem.default;
      }
      if (menuItem.type === "float") {
        menuItemElms = [
          <FloatEditor
            key="floatEditor"
            name={menuItem.name}
            min={menuItem.min}
            max={menuItem.max}
            initial={itemValue}
            onFocusedKeyDown={listener => this.props.onFocusedKeyDown(listener)}
            updateValue={value => this._updateValue(menuItem.presetKey, value)}
            closeEditor={() => this._backToLastMenuItem()}
          />
        ];
      } else if (menuItem.type === "int") {
        menuItemElms = [
          <IntEditor
            key="intEditor"
            name={menuItem.name}
            min={menuItem.min}
            max={menuItem.max}
            initial={itemValue}
            onFocusedKeyDown={listener => this.props.onFocusedKeyDown(listener)}
            updateValue={value => this._updateValue(menuItem.presetKey, value)}
            closeEditor={() => this._backToLastMenuItem()}
          />
        ];
      } else if (menuItem.type === "text") {
        menuItemElms = [
          <TextEditor
            key="textEditor"
            initial={itemValue}
            width={this.props.width}
            height={this.props.height}
            updateValue={value => this._updateValue(menuItem.presetKey, value)}
            closeEditor={() => this._backToLastMenuItem()}
          />
        ];
      }
    } else if (menuItem.items) {
      menuItemElms = menuItem.items.map((item, i) => {
        let itemLabel;
        if (item.type === "bool") {
          itemLabel = `${item.name}[${
            this._getValue(item.presetKey) ? "ON" : "OFF"
          }]`;
        } else {
          itemLabel = item.name;
        }

        return (
          <li
            key={i}
            style={{
              color:
                i === this.state.menuIdx[this.state.menuIdx.length - 1]
                  ? "#FF5050"
                  : "#CCCCCC",
              whiteSpace: "pre"
            }}
          >
            {itemLabel}
          </li>
        );
      });
      menuMeta =
        menuItem.items[this.state.menuIdx[this.state.menuIdx.length - 1]].meta;
    }

    return (
      <div>
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
              maxWidth: `${this.props.width - 30}px`,
              maxHeight: `${this.props.height - 30}px`,
              padding: "5px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              background: "rgba(0, 0, 0, 0.815)",
              fontFamily: "Courier New, Monaco, monospace",
              fontSize: "14px",
              fontWeight: "100"
            }}
          >
            <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
              {menuItemElms}
            </ul>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            maxWidth: `${this.props.width - 30}px`,
            background: "rgba(0, 0, 0, 0.815)",
            textAlign: "right",
            whiteSpace: "pre-line",
            overflow: "hidden"
          }}
        >
          <div style={{ color: "#CCCCCC", fontSize: "12px" }}>{menuMeta}</div>
        </div>
      </div>
    );
  }
}

export default PresetEditor;
