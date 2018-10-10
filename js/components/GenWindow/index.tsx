import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import classnames from "classnames";
import "../../../css/gen-window.css";

import { SET_FOCUSED_WINDOW } from "../../actionTypes";
import { scrollVolume, setWindowSize, closeWindow } from "../../actionCreators";
import { getWindowPixelSize } from "../../selectors";
import ResizeTarget from "../ResizeTarget";
import { AppState, WindowId, Dispatch } from "../../types";

interface TextProps {
  children: string;
}

const Text = ({ children }: TextProps) => {
  const letters = children.split("");
  return (
    <React.Fragment>
      {letters.map((letter, i) => (
        <div
          key={i}
          className={`draggable gen-text-letter gen-text-${
            letter === " " ? "space" : letter.toLowerCase()
          }`}
        />
      ))}
    </React.Fragment>
  );
};

const CHROME_WIDTH = 19;
const CHROME_HEIGHT = 34;

interface WindowSize {
  width: number;
  height: number;
}

interface OwnProps {
  windowId: WindowId;
  children: (windowSize: WindowSize) => React.ReactNode;
  title: string;
}

interface DispatchProps {
  setFocus: (windowId: WindowId) => void;
  close: (windowId: WindowId) => void;
  scrollVolume: (event: React.WheelEvent<HTMLDivElement>) => void;
  setGenWindowSize: (windowId: WindowId, size: [number, number]) => void;
}

interface StateProps {
  windowSize: [number, number];
  selected: boolean;
  height: number;
  width: number;
}

type Props = OwnProps & DispatchProps & StateProps;

// Named export for testing
export const GenWindow = ({
  selected,
  children,
  close,
  title,
  setFocus,
  windowId,
  windowSize,
  setGenWindowSize,
  scrollVolume: handleWheel,
  width,
  height
}: Props) => {
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
          <div className="gen-close selected" onClick={() => close(windowId)} />
        </div>
      </div>
      <div className="gen-middle">
        <div className="gen-middle-left draggable">
          <div className="gen-middle-left-bottom draggable" />
        </div>
        <div className="gen-middle-center">
          {children({
            width: width - CHROME_WIDTH,
            height: height - CHROME_HEIGHT
          })}
        </div>
        <div className="gen-middle-right draggable">
          <div className="gen-middle-right-bottom draggable" />
        </div>
      </div>
      <div className="gen-bottom draggable">
        <div className="gen-bottom-left draggable" />
        <div className="gen-bottom-right draggable">
          <ResizeTarget
            currentSize={windowSize}
            setWindowSize={size => setGenWindowSize(windowId, size)}
            id={"gen-resize-target"}
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  const { width, height } = getWindowPixelSize(state)(ownProps.windowId);
  return {
    width,
    height,
    selected: state.windows.focused === ownProps.windowId,
    windowSize: state.windows.genWindows[ownProps.windowId].size
  };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    setFocus: (windowId: WindowId) =>
      dispatch({ type: SET_FOCUSED_WINDOW, window: windowId }),
    close: (windowId: WindowId) => dispatch(closeWindow(windowId)),
    setGenWindowSize: (windowId: WindowId, size: [number, number]) =>
      dispatch(setWindowSize(windowId, size)),
    scrollVolume: e => dispatch(scrollVolume(e))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GenWindow);
