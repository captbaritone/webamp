import React from "react";

export default class WebampComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }
  componentDidMount() {
    this._loadWebamp();
  }

  componentWillUnmount() {
    this._unmounted = true;
    if (this._webamp) {
      // TODO: Repace this with this._webamp.destroy() once we upgrade.
      const close = document.querySelector("#webamp #close");
      close.click();
    }
  }

  async _loadWebamp() {
    let Webamp;
    Webamp = await import("webamp");
    if (this._unmounted === true) {
      return;
    }
    this._webamp = new Webamp({
      initialSkin: {
        url: this.props.skinUrl
      },
      initialTracks: [
        {
          metaData: {
            artist: "DJ Mike Llama",
            title: "Llama Whippin' Intro"
          },
          url: "/llama.mp3",
          duration: 5.322286
        }
      ],
      hotkeys: true,
      zIndex: 99999
    });

    setTimeout(async () => {
      await this._webamp.renderWhenReady(this._ref);
    }, 400);
    if (this._unmounted === true) {
      return;
    }
    // this.setState({ loading: false });
  }

  render() {
    return (
      <div
        style={{ width: "100%", height: "100%" }}
        ref={node => (this._ref = node)}
      >
        <img
          style={{ width: "100%", height: "100%" }}
          src={this.props.screenshotUrl}
        />
      </div>
    );
  }
}
