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
import Time from "./Time";
import ClutterBar from "./ClutterBar";

// Tell React that this environment supports `act`.
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function render(element: JSX.Element) {
  const enhancer = applyMiddleware(thunk as Middleware) as StoreEnhancer;
  const store = createStore(reducer, undefined, enhancer);
  act(() => root.render(<Provider store={store}>{element}</Provider>));
}

function keyDown(element: HTMLElement, key: string) {
  act(() => {
    element.dispatchEvent(
      new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })
    );
  });
}

describe("Time", () => {
  it("toggles remaining time from the keyboard", () => {
    render(<Time />);
    const time = container.querySelector<HTMLElement>("#time")!;
    expect(time.getAttribute("role")).toBe("button");
    expect(time.getAttribute("aria-label")).toBe("Toggle Remaining Time");
    expect(time.getAttribute("aria-pressed")).toBe("false");
    keyDown(time, " ");
    expect(time.getAttribute("aria-pressed")).toBe("true");
  });
});

describe("ClutterBar", () => {
  it("toggles doublesize mode from the keyboard", () => {
    render(<ClutterBar />);
    const button = container.querySelector<HTMLElement>("#button-d")!;
    expect(button.getAttribute("role")).toBe("button");
    expect(button.tabIndex).toBe(0);
    expect(button.getAttribute("aria-pressed")).toBe("false");
    keyDown(button, "Enter");
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.classList.contains("selected")).toBe(true);
  });
});
