import React from "react";
import screenfull from "screenfull";
import ContextMenuWrapper from "../ContextMenuWrapper";
import GenWindow from "../GenWindow";
import MilkdropContextMenu from "./MilkdropContextMenu";
import Desktop from "./Desktop";

import Presets from "./Presets";
import Milkdrop from "./Milkdrop";
import Background from "./Background";

import "../../../css/milkdrop-window.css";

// This component is just responsible for loading dependencies.
// This simplifies the inner <Milkdrop /> component, by allowing
// it to alwasy assume that it has its dependencies.
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
    this._enableDesktop = this._enableDesktop.bind(this);
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

  _enableDesktop() {
    this.setState({ desktop: true });
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

  _renderMilkdrop({ width, height }) {
    const { butterchurn, presets } = this.state;
    const loaded = butterchurn != null && presets != null;
    return (
      <Background innerRef={node => (this._wrapperNode = node)}>
        {loaded && (
          <Milkdrop
            {...this.props}
            width={width}
            height={height}
            isFullscreen={this.state.isFullscreen}
            presets={presets}
            butterchurn={butterchurn}
          />
        )}
      </Background>
    );
  }

  render() {
    if (this.state.isFullscreen) {
      const size = { width: screen.width, height: screen.height };
      return this._renderMilkdrop(size);
    } else if (this.state.desktop) {
      const size = { width: window.innerWidth, height: window.innerHeight };
      return <Desktop>{this._renderMilkdrop(size)}</Desktop>;
    }

    return (
      <GenWindow
        ref={this.props.chromeRef}
        title={this.props.title}
        windowId={this.props.windowId}
      >
        {({ height, width }) => (
          <ContextMenuWrapper
            onDoubleClick={this._handleRequestFullsceen}
            renderContents={() => (
              <MilkdropContextMenu
                close={this.props.close}
                toggleFullscreen={this._handleRequestFullsceen}
                enableDesktop={this._enableDesktop}
              />
            )}
          >
            {this._renderMilkdrop({ width, height })}
          </ContextMenuWrapper>
        )}
      </GenWindow>
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
