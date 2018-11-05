import React from "react";
import { connect } from "react-redux";
import screenfull from "screenfull";
import ContextMenuWrapper from "../ContextMenuWrapper";
import GenWindow from "../GenWindow";
import { WINDOWS } from "../../constants";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import MilkdropContextMenu from "./MilkdropContextMenu";
import Desktop from "./Desktop";

import Presets from "./Presets";
import Milkdrop from "./Milkdrop";
import Background from "./Background";

import "../../../css/milkdrop-window.css";

// This component is just responsible for loading dependencies.
// This simplifies the inner <Milkdrop /> component, by allowing
// it to always assume that it has its dependencies.
class PresetsLoader extends React.Component {
  constructor(props) {
    super(props);
    this.options = props.options;
    this.state = {
      presets: null,
      initialPreset: null,
      butterchurn: null,
      isFullscreen: false,
      desktop: false
    };
  }

  isHidden() {
    return this.state.desktop;
  }

  async componentDidMount() {
    const [
      { butterchurn, presetKeys, minimalPresets },
      initialPreset
    ] = await Promise.all([
      this.options.loadInitialDependencies(),
      loadInitialPreset(this.options)
    ]);

    const presets = new Presets({
      keys: presetKeys,
      initialPresets: minimalPresets,
      getRest: this.options.loadNonMinimalPresets,
      presetConverterEndpoint: this.options.presetConverterEndpoint,
      loadConvertPreset: this.options.loadConvertPreset
    });

    this.setState({
      butterchurn,
      initialPreset,
      presets
    });
    screenfull.onchange(this._handleFullscreenChange);
  }

  componentWillUnmount() {
    screenfull.off("change", this._handleFullscreenChange);
  }

  _handleFullscreenChange = () => {
    this.setState({ isFullscreen: screenfull.isFullscreen });
  };

  _toggleDesktop = () => {
    if (this.state.desktop) {
      this.props.showWindow();
      this.setState({ desktop: false });
    } else {
      this.props.hideWindow();
      this.setState({ desktop: true });
    }
  };

  _handleRequestFullsceen = () => {
    if (screenfull.enabled) {
      if (!screenfull.isFullscreen) {
        screenfull.request(this._wrapperNode);
      } else {
        screenfull.exit();
      }
    }
  };

  _renderMilkdrop(size) {
    const { butterchurn, presets, initialPreset } = this.state;
    const loaded = butterchurn != null && presets != null;
    const { width, height } = this.state.isFullscreen
      ? { width: screen.width, height: screen.height }
      : size;
    // Note: This _wrapperNode must not be removed from the DOM while
    // in/entering full screen mode. Ensure `this.setState({isFullscreen})`
    // does not cause this node to change identity.
    return (
      <Background innerRef={node => (this._wrapperNode = node)}>
        {loaded && (
          <Milkdrop
            {...this.props}
            width={width}
            height={height}
            isFullscreen={this.state.isFullscreen}
            presets={presets}
            initialPreset={initialPreset}
            butterchurn={butterchurn}
          />
        )}
      </Background>
    );
  }

  render() {
    if (this.state.desktop) {
      const size = { width: window.innerWidth, height: window.innerHeight };
      return (
        <ContextMenuWrapper
          onDoubleClick={this._handleRequestFullsceen}
          renderContents={() => (
            <MilkdropContextMenu
              close={this.props.closeWindow}
              toggleFullscreen={this._handleRequestFullsceen}
              desktopMode={this.state.desktop}
              toggleDesktop={this._toggleDesktop}
            />
          )}
        >
          <Desktop>{this._renderMilkdrop(size)}</Desktop>
        </ContextMenuWrapper>
      );
    }

    return (
      <GenWindow title={"Milkdrop"} windowId={WINDOWS.MILKDROP}>
        {({ height, width }) => (
          <ContextMenuWrapper
            onDoubleClick={this._handleRequestFullsceen}
            renderContents={() => (
              <MilkdropContextMenu
                close={this.props.closeWindow}
                toggleFullscreen={this._handleRequestFullsceen}
                desktopMode={this.state.desktop}
                toggleDesktop={this._toggleDesktop}
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

function presetNameFromURL(url) {
  try {
    const urlParts = url.split("/");
    const lastPart = urlParts[urlParts.length - 1];
    const presetName = lastPart.substring(0, lastPart.length - 5); // remove .milk or .json
    return decodeURIComponent(presetName);
  } catch (e) {
    // if something goes wrong parsing url, just use url as the preset name
    console.error(e);
    return url;
  }
}

async function loadInitialPreset({
  initialButterchurnPresetUrl,
  initialMilkdropPresetUrl
}) {
  if (initialButterchurnPresetUrl && initialMilkdropPresetUrl) {
    alert(
      "Unable to handle both milkdropPresetUrl and butterchurnPresetUrl. Please specify one or the other."
    );
  } else if (initialButterchurnPresetUrl) {
    return fetchPreset(initialButterchurnPresetUrl, { isButterchurn: true });
  } else if (initialMilkdropPresetUrl) {
    return fetchPreset(initialMilkdropPresetUrl, { isButterchurn: false });
  }
  return null;
}

async function fetchPreset(presetUrl, { isButterchurn }) {
  const response = await fetch(presetUrl);
  if (!response.ok) {
    console.error(response.statusText);
    alert(`Unable to load MilkDrop preset from ${presetUrl}`);
    return null;
  }
  const presetName = presetNameFromURL(presetUrl);

  let preset = null;
  if (isButterchurn) {
    try {
      preset = await response.json();
    } catch (e) {
      console.error(e);
      alert(`Failed to parse MilkDrop preset from ${presetUrl}`);
      return null;
    }
  } else {
    preset = { file: await response.blob() };
  }

  return { [presetName]: preset };
}

const mapStateToProps = state => ({
  isEnabledVisualizer: Selectors.getVisualizerStyle(state) === WINDOWS.MILKDROP,
  playing: Selectors.getMediaIsPlaying(state)
});

const mapDispatchToProps = dispatch => ({
  closeWindow: () => dispatch(Actions.closeWindow(WINDOWS.MILKDROP)),
  hideWindow: () => dispatch(Actions.hideWindow(WINDOWS.MILKDROP)),
  showWindow: () => dispatch(Actions.showWindow(WINDOWS.MILKDROP))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PresetsLoader);
