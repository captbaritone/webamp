import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Utils from "./utils";
import { Action, Thunk, AppState } from "./types";

interface Size {
  width: number;
  height: number;
}

export function useScreenSize() {
  const [size] = useState<Size>(Utils.getScreenSize());
  // TODO: We could subscribe to screen size changes.
  return size;
}

export function useWindowSize() {
  const [size, setSize] = useState<Size>(Utils.getWindowSize());
  const handler = Utils.throttle(() => {
    setSize(Utils.getWindowSize());
  }, 100) as () => void;
  useEffect(() => {
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
    };
  }, [setSize, handler]);
  return size;
}

export function useActionCreator<T extends (...args: any[]) => Action | Thunk>(
  actionCreator: T
): (...funcArgs: Parameters<T>) => void {
  const dispatch = useDispatch();
  return useCallback((...args) => dispatch(actionCreator(...args)), [
    dispatch,
    actionCreator,
  ]);
}

// TODO: Return useSelector directly and apply the type without wrapping
export function useTypedSelector<T>(selector: (state: AppState) => T): T {
  return useSelector(selector);
}

export function useTypedDispatch(): (action: Action | Thunk) => void {
  return useDispatch();
}
