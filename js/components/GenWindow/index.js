import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import classnames from "classnames";

import { SET_FOCUSED_WINDOW, CLOSE_GEN_WINDOW } from "../../actionTypes";
import { scrollVolume } from "../../actionCreators";

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
export const GenWindow = ({
  selected,
  children,
  close,
  title,
  setFocus,
  windowId,
  scrollVolume: handleWheel
}) => (
  <div
    className={classnames("gen-window", "window", { selected })}
    onMouseDown={() => setFocus(windowId)}
    onWheel={handleWheel}
  >
    <div className="gen-top draggable">
      <div className="gen-top-left draggable" />
      <div className="gen-top-left-right-fill draggable" />
      <div className="gen-top-left-end draggable" />
      <div className="gen-top-title draggable">
        <Text>{title}</Text>
      </div>
      <div className="gen-top-right-end draggable" />
      <div className="gen-top-left-right-fill draggable" />
      <div className="gen-top-right draggable">
        <div className="gen-close selected" onClick={() => close(windowId)} />
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
      <div className="gen-bottom-right draggable" />
    </div>
  </div>
);

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
