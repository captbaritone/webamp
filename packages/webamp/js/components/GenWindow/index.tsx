import * as React from "react";
import classnames from "classnames";
import "../../../css/gen-window.css";

import * as Actions from "../../actionCreators";
import * as Selectors from "../../selectors";
import ResizeTarget from "../ResizeTarget";
import { WindowId } from "../../types";
import FocusTarget from "../FocusTarget";
import { useActionCreator, useTypedSelector } from "../../hooks";

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

interface Props {
  windowId: WindowId;
  children: (windowSize: WindowSize) => React.ReactNode;
  title: string;
  onKeyDown?(e: KeyboardEvent): void;
}

// Named export for testing
export const GenWindow = ({ children, title, windowId, onKeyDown }: Props) => {
  const setWindowSize = useActionCreator(Actions.setWindowSize);
  const closeWindow = useActionCreator(Actions.closeWindow);
  const getWindowPixelSize = useTypedSelector(Selectors.getWindowPixelSize);
  const focusedWindow = useTypedSelector(Selectors.getFocusedWindow);
  const getWindowSize = useTypedSelector(Selectors.getWindowSize);
  const windowSize = getWindowSize(windowId);
  const selected = focusedWindow === windowId;
  const { width, height } = getWindowPixelSize(windowId);
  return (
    <FocusTarget windowId={windowId} onKeyDown={onKeyDown}>
      <div
        className={classnames("gen-window", "window", { selected })}
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
              onClick={() => closeWindow(windowId)}
            />
          </div>
        </div>
        <div className="gen-middle">
          <div className="gen-middle-left draggable">
            <div className="gen-middle-left-bottom draggable" />
          </div>
          <div className="gen-middle-center">
            {children({
              width: width - CHROME_WIDTH,
              height: height - CHROME_HEIGHT,
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
              setWindowSize={(size) => setWindowSize(windowId, size)}
              id={"gen-resize-target"}
            />
          </div>
        </div>
      </div>
    </FocusTarget>
  );
};

export default GenWindow;
