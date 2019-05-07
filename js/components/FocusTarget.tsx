import React, { useCallback, useState, useEffect } from "react";
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

  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref == null || onKeyDown == null) {
      return;
    }
    ref.addEventListener("keydown", onKeyDown);
    return () => ref.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown, windowId, focusedWindowId, ref]);

  useEffect(() => {
    if (ref == null || windowId !== focusedWindowId) {
      return;
    }

    // I give up. I can't figure out how to type this.
    const out: EventListener = (e: any) => {
      if (e.relatedTarget == null) {
        ref.focus();
      }
    };
    // https://github.com/facebook/react/issues/6410
    // React does not implement focusout. In this case we prefer focusout to
    // blur because it gets triggered when a child with focus unmounts.
    ref.addEventListener("focusout", out);
    return () => ref.removeEventListener("focusout", out);
  }, [windowId, focusedWindowId, ref]);

  return (
    <div
      ref={setRef}
      onMouseDown={focusHandler}
      onFocus={focusHandler}
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
