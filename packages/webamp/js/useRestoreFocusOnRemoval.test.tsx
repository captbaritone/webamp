// @types/react is still on v18, which does not declare React 19's `act`.
// @ts-ignore
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { useRestoreFocusOnRemoval } from "./hooks";

// Tell React that this environment supports `act`.
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function Harness({ root }: { root: HTMLElement }) {
  useRestoreFocusOnRemoval(root);
  return null;
}

let webampRoot: HTMLElement;
let outside: HTMLButtonElement;
let reactContainer: HTMLDivElement;
let reactRoot: Root;

function byId(id: string): HTMLElement {
  return document.getElementById(id)!;
}

beforeEach(() => {
  webampRoot = document.createElement("div");
  webampRoot.tabIndex = -1;
  webampRoot.innerHTML = `
    <div id="main" data-window-id="main" tabindex="-1">
      <button id="play"></button>
    </div>
    <div id="equalizer" data-window-id="equalizer" tabindex="-1">
      <button id="eq-shade"></button>
      <button id="eq-close"></button>
    </div>
  `;
  outside = document.createElement("button");
  reactContainer = document.createElement("div");
  document.body.append(webampRoot, outside, reactContainer);
  reactRoot = createRoot(reactContainer);
  act(() => reactRoot.render(<Harness root={webampRoot} />));
});

afterEach(() => {
  act(() => reactRoot.unmount());
  webampRoot.remove();
  outside.remove();
  reactContainer.remove();
});

function pressKey() {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
}

function pointerDown(target: Element) {
  target.dispatchEvent(new Event("pointerdown", { bubbles: true }));
}

// MutationObserver callbacks run as microtasks.
const flush = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

describe("useRestoreFocusOnRemoval", () => {
  it("moves focus to the main window when a window is closed from the keyboard", async () => {
    byId("eq-close").focus();
    pressKey();
    byId("equalizer").remove();
    await flush();
    expect(document.activeElement).toBe(byId("main"));
  });

  it("keeps focus in the same window if it is still open", async () => {
    byId("eq-shade").focus();
    pressKey();
    byId("eq-shade").remove();
    await flush();
    expect(document.activeElement).toBe(byId("equalizer"));
  });

  it("moves focus to another open window if the main window is closed", async () => {
    byId("play").focus();
    pressKey();
    byId("main").remove();
    await flush();
    expect(document.activeElement).toBe(byId("equalizer"));
  });

  it("moves focus to the root when every window is closed", async () => {
    byId("play").focus();
    pressKey();
    webampRoot.innerHTML = "";
    await flush();
    expect(document.activeElement).toBe(webampRoot);
  });

  it("does nothing for pointer users", async () => {
    pressKey();
    pointerDown(byId("eq-close"));
    byId("eq-close").focus();
    byId("equalizer").remove();
    await flush();
    expect(document.activeElement).toBe(document.body);
  });

  it("does nothing if focus has moved outside of Webamp", async () => {
    byId("eq-close").focus();
    pressKey();
    outside.focus();
    byId("equalizer").remove();
    await flush();
    expect(document.activeElement).toBe(outside);
  });

  it("does nothing if the user clicked outside of Webamp", async () => {
    byId("eq-close").focus();
    pressKey();
    pointerDown(document.body);
    pressKey();
    byId("equalizer").remove();
    await flush();
    expect(document.activeElement).toBe(document.body);
  });
});
