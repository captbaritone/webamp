import React from "react";
import { connect } from "react-redux";
import * as ActionCreators from "./redux/actionCreators";

class Disposable {
  _subscriptions = [];
  add(subscription) {
    this._subscriptions.push(subscription);
  }
  dispose() {
    this._subscriptions.forEach(subscription => {
      subscription();
    });
  }
}

class WebampComponent extends React.Component {
  constructor(props) {
    super(props);
    this._disposable = new Disposable();
  }
  componentDidMount() {
    this._loadWebamp();
  }

  componentWillUnmount() {
    this._unmounted = true;
    this._disposable.dispose();

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
      zIndex: 1001
    });

    this._disposable.add(this._webamp.onClose(this.props.closeModal));

    const renderTimeout = setTimeout(
      async () => {
        await this._webamp.renderWhenReady(this._ref);
        if (!this._unmounted) {
          this.props.loaded();
        }
      },
      // This number must be higher than the transition time of the CSS animation that puts this in place.
      500
    );
    this._disposable.add(() => {
      clearTimeout(renderTimeout);
    });
  }

  render() {
    return (
      <div
        style={{ width: "100%", height: "100%", position: "absolute" }}
        ref={node => (this._ref = node)}
      />
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
