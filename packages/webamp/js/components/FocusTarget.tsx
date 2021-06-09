import { useCallback, useState, useEffect } from "react";
import { WindowId } from "../types";
import * as Actions from "../actionCreators";
import * as Selectors from "../selectors";
import { useActionCreator, useTypedSelector } from "../hooks";

interface Props {
  onKeyDown?(e: KeyboardEvent): void;
  windowId: WindowId;
  children: React.ReactNode;
}

function FocusTarget({ onKeyDown, windowId, children }: Props) {
  const focusedWindowId = useTypedSelector(Selectors.getFocusedWindow);
  const setFocus = useActionCreator(Actions.setFocusedWindow);

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

  // It's possible for a child component to gain focus and then become
  // unmounted. In that case, the browser will return focus to the `<body>`.
  // In the following hook, use a `MutationObserver` to watch for that behavior
  // and refocus the containing FocusTarget when it happens.
  //
  // I tried a number of other approaches using `focus/blur/focusin/focusout` on
  // various DOM nodes, and was unable to find a solution which would trigger in
  // this senario in Firefox. Therefore we use this `MutationObserver` approach.
  useEffect(() => {
    // Only create the `MutationObserver` within the currently focused target.
    if (ref == null || windowId !== focusedWindowId) {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      // In the common case we won't have focused the body, so we can do this
      // inexpensive check first to avoid calling the more expensive `O(n)`
      // check of the individual mutations.
      if (document.activeElement !== document.body) {
        return;
      }
      if (mutations.some((mutation) => mutation.removedNodes.length > 0)) {
        ref.focus();
      }
    });

    observer.observe(ref, {
      subtree: true,
      attributes: false,
      childList: true,
    });

    return () => observer.disconnect();
  }, [windowId, focusedWindowId, ref]);

  return (
    <div
      ref={setRef}
      onMouseDown={focusHandler}
      onTouchStart={focusHandler}
      onFocus={focusHandler}
      tabIndex={-1}
      style={{ height: "100%", width: "100%" }}
    >
      {children}
    </div>
  );
}

export default FocusTarget;
