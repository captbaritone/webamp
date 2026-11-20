// @types/react is still on v18, which does not declare React 19's `act`.
// @ts-ignore
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { Provider } from "react-redux";
import { legacy_createStore as createStore } from "redux";
import reducer from "../reducers";
import { WindowId } from "../types";
import FocusTarget from "./FocusTarget";

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

describe("FocusTarget", () => {
  it.each([
    ["main", "Main window"],
    ["equalizer", "Equalizer"],
    ["playlist", "Playlist"],
    ["milkdrop", "Milkdrop"],
  ])("labels the %s window as a group", (windowId, label) => {
    act(() =>
      root.render(
        <Provider store={createStore(reducer)}>
          <FocusTarget windowId={windowId as WindowId}>
            <div />
          </FocusTarget>
        </Provider>
      )
    );
    const group = container.firstElementChild!;
    expect(group.getAttribute("role")).toBe("group");
    expect(group.getAttribute("aria-label")).toBe(label);
  });
});
