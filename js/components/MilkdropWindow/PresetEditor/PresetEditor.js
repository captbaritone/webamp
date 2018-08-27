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
      menuIdx: 0,
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
      menuIdx: 0
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
          this.setState({ menuIdx: Math.max(this.state.menuIdx - 1, 0) });
        }
        e.stopPropagation();
        break;
      case 40: // down arrow
        if (menuItem.items) {
          this.setState({
            menuIdx: Math.min(this.state.menuIdx + 1, menuItem.items.length - 1)
          });
        }
        e.stopPropagation();
        break;
      case 13: // enter
        if (menuItem.items) {
          const selectedItem = menuItem.items[this.state.menuIdx];
          if (selectedItem.type === "bool") {
            this._updateValue(
              selectedItem.presetKey,
              this._getValue(selectedItem.presetKey) ? 0 : 1
            );
          } else {
            this.setState({
              menuKey: this.state.menuKey.concat(
                menuItem.items[this.state.menuIdx].name
              ),
              menuIdx: 0
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
    } else {
      // need to convert base preset equations
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
              color: i === this.state.menuIdx ? "#FF5050" : "#CCCCCC",
              whiteSpace: "pre"
            }}
          >
            {itemLabel}
          </li>
        );
      });
      menuMeta = menuItem.items[this.state.menuIdx].meta;
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
              fontSize: "12px"
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
            whiteSpace: "nowrap",
            overflow: "hidden"
          }}
        >
          <span style={{ color: "#CCCCCC", fontSize: "12px" }}>{menuMeta}</span>
        </div>
      </div>
    );
  }
}

export default PresetEditor;
