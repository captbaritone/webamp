import React from "react";
import * as Utils from "./utils";
import { SCREENSHOT_HEIGHT } from "./constants";

export default class Skin extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loaded: false, focused: false };
    this._handleLoad = this._handleLoad.bind(this);
    this._ref = null;
  }

  _handleLoad() {
    this.setState({ loaded: true });
  }

  render() {
    return (
      <a
        className={"skin"}
        ref={node => {
          this._ref = node;
        }}
        style={{
          ...this.props.style,
          display: "block",
          height: this.props.height,
          width: this.props.width,
          // Ideally the final backgroundColor would be black
          // But that makes our opacitly transition kinda funky
          backgroundColor: this.props.color,
          cursor: "pointer"
        }}
        onClick={e => {
          if (Utils.eventIsLinkClick(e)) {
            e.preventDefault();
            const { top, left } = this._ref.getBoundingClientRect();
            this.props.selectSkin(this.props.hash, { top, left });
          }
        }}
        href={this.props.permalink}
      >
        <img
          tabIndex={1}
          src={this.props.src}
          style={{
            imageRendering:
              this.props.height >= SCREENSHOT_HEIGHT ? "pixelated" : null
          }}
          className={`screenshot ${this.state.loaded ? "loaded" : ""}`}
          onLoad={this._handleLoad}
          alt={this.props.fileName}
        />
      </a>
    );
  }
}
