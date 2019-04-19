import React, { useCallback, useRef, useEffect } from "react";
import { WindowId, AppState, Dispatch } from "../types";
import * as Actions from "../actionCreators";
import * as Selectors from "../selectors";
import { connect } from "react-redux";

interface DispatchProps {
  setFocus(windowId: WindowId | null): void;
}
interface StateProps {
  focusedWindowId: WindowId | null;
}

interface OwnProps {
  onKeyDown?(e: KeyboardEvent): void;
  windowId: WindowId;
  children: React.ReactNode;
}

type Props = StateProps & DispatchProps & OwnProps;

function FocusTarget(props: Props) {
  const { onKeyDown, focusedWindowId, windowId, setFocus, children } = props;

  const focusHandler = useCallback(() => {
    if (windowId !== focusedWindowId) {
      setFocus(windowId);
    }
  }, [windowId, focusedWindowId, setFocus]);

  const blurHandler = useCallback(() => {
    setFocus(null);
  }, [setFocus]);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { current } = ref;
    if (current == null) {
      return;
    }
    const listener = (e: KeyboardEvent) => {
      if (windowId === focusedWindowId && onKeyDown != null) {
        onKeyDown(e);
      }
    };
    current.addEventListener("keydown", listener);
    return () => current.removeEventListener("keydown", listener);
  }, [onKeyDown, windowId, focusedWindowId]);

  return (
    <div
      ref={ref}
      onMouseDown={focusHandler}
      onBlur={blurHandler}
      tabIndex={-1}
      style={{ height: "100%", width: "100%" }}
    >
      {children}
    </div>
  );
}

function mapStateToProps(state: AppState): StateProps {
  return {
    focusedWindowId: Selectors.getFocusedWindow(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    setFocus: windowId => dispatch(Actions.setFocusedWindow(windowId)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FocusTarget);
