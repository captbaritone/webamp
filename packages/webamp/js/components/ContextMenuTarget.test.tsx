// @types/react is still on v18, which does not declare React 19's `act`.
// @ts-ignore
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { Provider } from "react-redux";
import { legacy_createStore as createStore } from "redux";
import reducer from "../reducers";
import ContextMenuTarget from "./ContextMenuTarget";
import { Node, Parent, Hr } from "./ContextMenu";

// Tell React that this environment supports `act`.
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let onPlay: ReturnType<typeof vi.fn>;
let onSkin: ReturnType<typeof vi.fn>;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  onPlay = vi.fn();
  onSkin = vi.fn();
  act(() =>
    root.render(
      <Provider store={createStore(reducer)}>
        <ContextMenuTarget
          label="Winamp Menu"
          renderMenu={() => (
            <>
              <Node label="Play" onClick={onPlay} />
              <Hr />
              <Node label="Repeat" checked />
              <Parent label="Skins">
                <Node label="Base Skin" onClick={onSkin} />
                <Node label="Other Skin" />
              </Parent>
            </>
          )}
        >
          <div id="option" />
        </ContextMenuTarget>
      </Provider>
    )
  );
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function trigger(): HTMLElement {
  return container.querySelector('[role="button"]')!;
}

function menu(): HTMLElement | null {
  return document.querySelector(".context-menu");
}

function item(label: string): HTMLElement {
  return document.querySelector(`[aria-label="${label}"]`)!;
}

function keyDown(key: string, element = document.activeElement!) {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    element.dispatchEvent(event);
  });
  return event;
}

function openWithKeyboard() {
  act(() => trigger().focus());
  keyDown("Enter");
}

describe("ContextMenuTarget", () => {
  it("renders a labelled menu button", () => {
    expect(trigger().getAttribute("aria-label")).toBe("Winamp Menu");
    expect(trigger().getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(trigger().tabIndex).toBe(0);
  });

  it("opens with the keyboard and focuses the first item", () => {
    openWithKeyboard();
    expect(menu()!.getAttribute("role")).toBe("menu");
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(item("Play"));
  });

  it("opens with Space and ArrowDown too", () => {
    act(() => trigger().focus());
    keyDown(" ");
    expect(document.activeElement).toBe(item("Play"));
    keyDown("Escape");
    keyDown("ArrowDown");
    expect(document.activeElement).toBe(item("Play"));
  });

  it("does not move focus into the menu when opened with the mouse", () => {
    act(() => trigger().click());
    expect(menu()).not.toBe(null);
    expect(document.activeElement).not.toBe(item("Play"));
  });

  it("exposes item roles and state", () => {
    openWithKeyboard();
    expect(item("Play").getAttribute("role")).toBe("menuitem");
    expect(item("Repeat").getAttribute("role")).toBe("menuitemcheckbox");
    expect(item("Repeat").getAttribute("aria-checked")).toBe("true");
    expect(document.querySelector(".hr")!.getAttribute("role")).toBe(
      "separator"
    );
    expect(item("Skins").getAttribute("aria-haspopup")).toBe("menu");
  });

  it("moves through items with the arrow keys, skipping separators", () => {
    openWithKeyboard();
    keyDown("ArrowDown");
    expect(document.activeElement).toBe(item("Repeat"));
    keyDown("ArrowDown");
    expect(document.activeElement).toBe(item("Skins"));
    keyDown("ArrowDown");
    expect(document.activeElement).toBe(item("Play"));
    keyDown("ArrowUp");
    expect(document.activeElement).toBe(item("Skins"));
    keyDown("Home");
    expect(document.activeElement).toBe(item("Play"));
    keyDown("End");
    expect(document.activeElement).toBe(item("Skins"));
  });

  it("activates an item with Enter, closes, and returns focus to the trigger", () => {
    openWithKeyboard();
    keyDown("Enter");
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(menu()).toBe(null);
    expect(document.activeElement).toBe(trigger());
  });

  it("closes with Escape and returns focus to the trigger", () => {
    openWithKeyboard();
    keyDown("Escape");
    expect(menu()).toBe(null);
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger());
  });

  it("opens and closes submenus with the arrow keys", () => {
    openWithKeyboard();
    keyDown("End");
    expect(item("Skins").getAttribute("aria-expanded")).toBe("false");
    keyDown("ArrowRight");
    expect(item("Skins").getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(item("Base Skin"));
    keyDown("ArrowDown");
    expect(document.activeElement).toBe(item("Other Skin"));
    keyDown("ArrowLeft");
    expect(item("Skins").getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(item("Skins"));
  });

  it("closes only the submenu on Escape within it", () => {
    openWithKeyboard();
    keyDown("End");
    keyDown("Enter");
    expect(document.activeElement).toBe(item("Base Skin"));
    keyDown("Escape");
    expect(menu()).not.toBe(null);
    expect(document.activeElement).toBe(item("Skins"));
  });

  it("activates submenu items", () => {
    openWithKeyboard();
    keyDown("End");
    keyDown("ArrowRight");
    keyDown(" ");
    expect(onSkin).toHaveBeenCalledTimes(1);
    expect(menu()).toBe(null);
    expect(document.activeElement).toBe(trigger());
  });

  it("does not let navigation keys reach document-level hotkeys", () => {
    const hotkeyListener = vi.fn();
    document.addEventListener("keydown", hotkeyListener);
    openWithKeyboard();
    keyDown("ArrowDown");
    document.removeEventListener("keydown", hotkeyListener);
    expect(hotkeyListener).not.toHaveBeenCalled();
  });
});
