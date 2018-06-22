import React from "react";
import screenfull from "screenfull";
import ContextMenuWrapper from "../ContextMenuWrapper";
import MilkdropContextMenu from "./MilkdropContextMenu";
import Desktop from "./Desktop";

import Presets from "./Presets";
import Milkdrop from "./Milkdrop";
import Background from "./Background";

import "../../../css/milkdrop-window.css";

// This component is just responsible for loading dependencies.
// This simplifies the inner <Milkdrop /> component, by allowing
// it to alwasy assume that it has it's dependencies.
export default class PresetsLoader extends React.Component {
  constructor() {
    super();
    this.state = {
      presets: null,
      butterchurn: null,
      isFullscreen: false,
      desktop: false
    };
    this._handleFullscreenChange = this._handleFullscreenChange.bind(this);
    this._handleRequestFullsceen = this._handleRequestFullsceen.bind(this);
  }

  async componentDidMount() {
    const {
      butterchurn,
      presetKeys,
      minimalPresets
    } = await loadInitialDependencies();

    this.setState({
      butterchurn,
      presets: new Presets({
        keys: presetKeys,
        initialPresets: minimalPresets,
        getRest: loadNonMinimalPresets
      })
    });
    screenfull.onchange(this._handleFullscreenChange);
  }

  componentWillUnmount() {
    screenfull.off("change", this._handleFullscreenChange);
  }

  _handleFullscreenChange() {
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

  render() {
    const { butterchurn, presets } = this.state;
    const loaded = butterchurn != null && presets != null;

    let size = { width: this.props.width, height: this.props.height };
    if (this.state.isFullscreen) {
      size = { width: screen.width, height: screen.height };
    } else if (this.state.desktop) {
      size = { width: window.innerWidth, height: window.innerHeight };
    }

    const milkdrop = loaded && (
      <Milkdrop
        {...this.props}
        width={size.width}
        height={size.height}
        isFullscreen={this.state.isFullscreen}
        presets={presets}
        butterchurn={butterchurn}
      />
    );

    return (
      <ContextMenuWrapper
        onDoubleClick={this._handleRequestFullsceen}
        renderContents={() => (
          <MilkdropContextMenu
            close={this.props.close}
            toggleFullscreen={this._handleRequestFullsceen}
          />
        )}
      >
        <Background innerRef={node => (this._wrapperNode = node)}>
          {this.state.desktop ? <Desktop>{milkdrop}</Desktop> : milkdrop}
        </Background>
      </ContextMenuWrapper>
    );
  }
}

async function loadInitialDependencies() {
  return new Promise((resolve, reject) => {
    require.ensure(
      [
        "butterchurn",
        "butterchurn-presets/lib/butterchurnPresetsMinimal.min",
        "butterchurn-presets/lib/butterchurnPresetPackMeta.min"
      ],
      require => {
        const butterchurn = require("butterchurn");
        const butterchurnMinimalPresets = require("butterchurn-presets/lib/butterchurnPresetsMinimal.min");
        const presetPackMeta = require("butterchurn-presets/lib/butterchurnPresetPackMeta.min");
        resolve({
          butterchurn,
          minimalPresets: butterchurnMinimalPresets.getPresets(),
          presetKeys: presetPackMeta.getMainPresetMeta().presets
        });
      },
      reject,
      "butterchurn"
    );
  });
}

async function loadNonMinimalPresets() {
  return new Promise((resolve, reject) => {
    require.ensure(
      ["butterchurn-presets/lib/butterchurnPresetsNonMinimal.min"],
      require => {
        resolve(
          require("butterchurn-presets/lib/butterchurnPresetsNonMinimal.min").getPresets()
        );
      },
      reject,
      "butterchurn-presets"
    );
  });
}
