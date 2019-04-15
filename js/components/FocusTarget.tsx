import React, { useCallback } from "react";
import { WindowId, AppState, Dispatch } from "../types";
import * as Actions from "../actionCreators";
import * as Selectors from "../selectors";
import { connect } from "react-redux";

interface DispatchProps {
  setFocus(windowId: WindowId): void;
}
interface StateProps {
  focusedWindowId: WindowId;
}

interface OwnProps {
  onKeyDown?(e: React.KeyboardEvent<HTMLDivElement>): void;
  windowId: WindowId;
  children: React.ReactNode;
}

type Props = StateProps & DispatchProps & OwnProps;

function FocusTarget(props: Props) {
  const { onKeyDown, focusedWindowId, windowId, setFocus, children } = props;
  const keyDownHandler = useCallback(
    e => {
      if (windowId === focusedWindowId && onKeyDown != null) {
        onKeyDown(e);
      }
    },
    [onKeyDown, windowId, focusedWindowId]
  );

  const focusHandler = useCallback(() => {
    if (windowId !== focusedWindowId) {
      setFocus(windowId);
    }
  }, [windowId, focusedWindowId]);

  return (
    <div
      onFocus={keyDownHandler}
      onMouseDown={focusHandler}
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
