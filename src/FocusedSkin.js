import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import classnames from "classnames";
import WebampComponent from "./WebampComponent";
import * as Utils from "./utils";
import * as Selectors from "./redux/selectors";
import { SCREENSHOT_HEIGHT, SCREENSHOT_WIDTH } from "./constants";

class FocusedSkin extends React.Component {
  constructor(props) {
    super(props);
    // TODO: Handle the case were we come from a permalink
    if (this.props.initialPosition == null) {
      this.state = Object.assign({ loaded: false }, this._getCenteredState());
    } else {
      this.state = {
        loaded: false,
        top: this.props.initialPosition.top,
        left: this.props.initialPosition.left,
        width: this.props.initialWidth,
        height: this.props.initialHeight
      };
    }
    this._imgWrapper = document.createElement("div");
    this._imgWrapper.style.zIndex = "10002";
    this._imgWrapper.style.position = "fixed";
    this._imgWrapper.style.top = 0;
    document.body.appendChild(this._imgWrapper);
  }

  componentWillUnmount() {
    document.body.removeChild(this._imgWrapper);
  }

  componentDidMount() {
    setTimeout(() => {
      // TODO: Observe DOM and recenter
      this.setState(this._getCenteredState());
    }, 0);
  }

  _getCenteredState() {
    // TODO: Observe DOM and recenter
    const { windowWidth, windowHeight } = Utils.getWindowSize();
    return {
      top: (windowHeight - SCREENSHOT_HEIGHT) / 2,
      left: (windowWidth - SCREENSHOT_WIDTH) / 2,
      height: SCREENSHOT_HEIGHT,
      width: SCREENSHOT_WIDTH
    };
  }
  render() {
    const { loaded } = this.state;
    return ReactDOM.createPortal(
      <div
        id="focused-skin"
        className={classnames({ loaded })}
        style={{
          position: "fixed",
          height: this.state.height,
          width: this.state.width,
          transform: `translateX(${Math.round(
            this.state.left
          )}px) translateY(${Math.round(this.state.top)}px)`,
          transition:
            "all 400ms ease-out, height 400ms ease-out, width 400ms ease-out"
        }}
      >
        <WebampComponent
          key={this.props.hash} // Don't reuse instances
          skinUrl={Utils.skinUrlFromHash(this.props.hash)}
          screenshotUrl={Utils.screenshotUrlFromHash(this.props.hash)}
          loaded={() => this.setState({ loaded: true })}
        />
        <div className="metadata">
          <div className="file-name">
            {Utils.filenameFromHash(this.props.hash)}
          </div>
          <a href={Utils.skinUrlFromHash(this.props.hash)}>Download</a>
        </div>
      </div>,
      this._imgWrapper
    );
  }
}

const mapStateToProps = state => ({
  hash: Selectors.getSelectedSkinHash(state),
  initialPosition: Selectors.getSelectedSkinPosition(state)
});

export default connect(mapStateToProps)(FocusedSkin);
