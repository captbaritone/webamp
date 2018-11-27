import React from "react";
import { connect } from "react-redux";
import * as ActionCreators from "./redux/actionCreators";

class WebampComponent extends React.Component {
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
      if (close != null) {
        close.click();
      }
    }
  }

  async _loadWebamp() {
    const Webamp = (await import("webamp")).default;
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

    // TODO: Technically we should unsubscribe this on unmount
    this._webamp.onClose(this.props.closeModal);

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
          style={{
            width: "100%",
            height: "100%",
            // Webamp measure the scrollHeight of the container. Making this a
            // block element ensures the parent element's scrollHeight is not
            // expanded.
            display: "block"
          }}
          src={this.props.screenshotUrl}
        />
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  closeModal() {
    dispatch(ActionCreators.closeModal());
  }
});
export default connect(
  null,
  mapDispatchToProps
)(WebampComponent);
