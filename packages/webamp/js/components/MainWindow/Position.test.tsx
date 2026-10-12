// @types/react is still on v18, which does not declare React 19's `act`.
// @ts-ignore
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { Provider } from "react-redux";
import {
  legacy_createStore as createStore,
  applyMiddleware,
  Middleware,
  StoreEnhancer,
} from "redux";
import { thunk } from "redux-thunk";
import reducer from "../../reducers";
import { Action } from "../../types";
import Position from "./Position";

// Tell React that this environment supports `act`.
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let actions: Action[];
let input: HTMLInputElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  actions = [];

  // Thirty seconds into a two minute track.
  const initialState = reducer(undefined, { type: "@@init" } as any);
  const state = {
    ...initialState,
    playlist: { ...initialState.playlist, currentTrack: 1 },
    tracks: { 1: { id: 1, duration: 120 } },
    media: { ...initialState.media, timeElapsed: 30 },
  };
  const recordActions: Middleware = () => (next) => (action) => {
    actions.push(action as Action);
    return next(action);
  };
  const enhancer = applyMiddleware(
    thunk as Middleware,
    recordActions
  ) as StoreEnhancer;
  const store = createStore(reducer, state as any, enhancer);
  act(() =>
    root.render(
      <Provider store={store}>
        <Position />
      </Provider>
    )
  );
  input = container.querySelector("#position")!;
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function keyDown(key: string) {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    input.dispatchEvent(event);
  });
  return event;
}

function changeValue(value: string) {
  // Bypass React's value tracking so that it sees the change.
  Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )!.set!.call(input, value);
  act(() => {
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function pointer(type: "pointerdown" | "pointerup") {
  act(() => {
    input.dispatchEvent(new Event(type, { bubbles: true }));
  });
}

function seeks() {
  return actions
    .filter((action) => action.type === "SEEK_TO_PERCENT_COMPLETE")
    .map((action) => (action as any).percent);
}

describe("Position", () => {
  it("seeks forward five seconds on ArrowRight", () => {
    expect(keyDown("ArrowRight").defaultPrevented).toBe(true);
    expect(seeks()).toEqual([(35 / 120) * 100]);
  });

  it("seeks backward five seconds on ArrowLeft", () => {
    expect(keyDown("ArrowLeft").defaultPrevented).toBe(true);
    expect(seeks()).toEqual([(25 / 120) * 100]);
  });

  it("leaves other keys alone", () => {
    expect(keyDown("Home").defaultPrevented).toBe(false);
    expect(seeks()).toEqual([]);
  });

  it("seeks immediately on input that does not come from a pointer", () => {
    changeValue("50");
    expect(seeks()).toEqual([50]);
  });

  it("only previews the position while dragging with a pointer", () => {
    pointer("pointerdown");
    changeValue("50");
    changeValue("60");
    expect(seeks()).toEqual([]);
    pointer("pointerup");
    expect(seeks()).toEqual([60]);
  });

  it("describes the position as elapsed time of total time", () => {
    expect(input.getAttribute("aria-valuetext")).toBe("0:30 of 2:00");
  });

  it("describes the scrub position while dragging", () => {
    pointer("pointerdown");
    changeValue("50");
    expect(input.getAttribute("aria-valuetext")).toBe("1:00 of 2:00");
  });
});
