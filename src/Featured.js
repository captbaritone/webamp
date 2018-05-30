import React from "react";
import Webamp from "webamp";

export default class Featured extends React.Component {
  constructor() {
    super();
  }

  componentDidMount() {
    /*
    this._webamp = new Webamp({
      initialSkin: {
        url: this.props.skinUrl
      }
    });
    this._webamp.renderWhenReady(this.player);
    */
  }

  render() {
    return (
      <div id="overlay" onClick={this.props.dismiss}>
        <div id="player" ref={node => (this.player = node)} />
        <img src={this.props.skinUrl} />
      </div>
    );
  }
}
