import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import classnames from "classnames";

import { SET_FOCUSED_WINDOW, CLOSE_GEN_WINDOW } from "../../actionTypes";
import { scrollVolume } from "../../actionCreators";
import { getWindowPixelSize } from "../../selectors";
import ResizeTarget from "../ResizeTarget";

const Text = ({ children }) => {
  const letters = children.split("");
  return letters.map((letter, i) => (
    <div
      key={i}
      className={`draggable gen-text-letter gen-text-${
        letter === " " ? "space" : letter.toLowerCase()
      }`}
    />
  ));
};

// Named export for testing
export class GenWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = { windowSize: [0, 0] };
  }
  render() {
    const {
      selected,
      children,
      close,
      title,
      setFocus,
      windowId,
      scrollVolume: handleWheel
    } = this.props;
    const { width, height } = getWindowPixelSize(this.state.windowSize);
    return (
      <div
        className={classnames("gen-window", "window", { selected })}
        onMouseDown={() => setFocus(windowId)}
        onWheel={handleWheel}
        style={{ width, height }}
      >
        <div className="gen-top draggable">
          <div className="gen-top-left draggable" />
          <div className="gen-top-left-fill draggable" />
          <div className="gen-top-left-end draggable" />
          <div className="gen-top-title draggable">
            <Text>{title}</Text>
          </div>
          <div className="gen-top-right-end draggable" />
          <div className="gen-top-right-fill draggable" />
          <div className="gen-top-right draggable">
            <div
              className="gen-close selected"
              onClick={() => close(windowId)}
            />
          </div>
        </div>
        <div className="gen-middle">
          <div className="gen-middle-left draggable">
            <div className="gen-middle-left-bottom draggable" />
          </div>
          <div className="gen-middle-center">{children}</div>
          <div className="gen-middle-right draggable">
            <div className="gen-middle-right-bottom draggable" />
          </div>
        </div>
        <div className="gen-bottom draggable">
          <div className="gen-bottom-left draggable" />
          <div className="gen-bottom-right draggable">
            <ResizeTarget
              currentSize={this.state.windowSize}
              setWindowSize={size => this.setState({ windowSize: size })}
              id={"gen-resize-target"}
            />
          </div>
        </div>
      </div>
    );
  }
}

GenWindow.propTypes = {
  title: PropTypes.string.isRequired,
  windowId: PropTypes.string.isRequired,
  children: PropTypes.node,
  close: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  selected: state.windows.focused === ownProps.windowId
});

const mapDispatchToProps = {
  setFocus: windowId => ({ type: SET_FOCUSED_WINDOW, window: windowId }),
  close: windowId => ({ type: CLOSE_GEN_WINDOW, windowId }),
  scrollVolume
};

export default connect(mapStateToProps, mapDispatchToProps)(GenWindow);
