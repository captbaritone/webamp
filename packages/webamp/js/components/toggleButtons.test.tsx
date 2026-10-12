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
import reducer from "../reducers";
import Shuffle from "./MainWindow/Shuffle";
import Repeat from "./MainWindow/Repeat";
import EqOn from "./EqualizerWindow/EqOn";

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

function pressSpace(element: HTMLElement) {
  act(() => {
    element.dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true })
    );
  });
}

describe.each([
  ["Shuffle", <Shuffle key="shuffle" />, "Toggle Shuffle"],
  ["Repeat", <Repeat key="repeat" />, "Toggle Repeat"],
  ["EqOn", <EqOn key="on" />, "On"],
])("%s", (_name, element, accessibleName) => {
  it("exposes its toggle state with aria-pressed", () => {
    render(element);
    const button = container.querySelector<HTMLElement>('[role="button"]')!;
    expect(
      button.getAttribute("title") ?? button.getAttribute("aria-label")
    ).toBe(accessibleName);
    const initial = button.getAttribute("aria-pressed");
    expect(initial === "true" || initial === "false").toBe(true);
    pressSpace(button);
    expect(button.getAttribute("aria-pressed")).toBe(
      initial === "true" ? "false" : "true"
    );
  });
});
