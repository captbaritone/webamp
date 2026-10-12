// @types/react is still on v18, which does not declare React 19's `act`.
// @ts-ignore
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import WinampButton from "./WinampButton";
import ClickedDiv from "./ClickedDiv";

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

function render(element: JSX.Element): HTMLElement {
  act(() => root.render(element));
  return container.firstElementChild as HTMLElement;
}

function keyDown(element: HTMLElement, key: string, init?: KeyboardEventInit) {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  act(() => {
    element.dispatchEvent(event);
  });
  return event;
}

describe("WinampButton", () => {
  it("is a focusable button when it has an onClick handler", () => {
    const button = render(<WinampButton title="Play" onClick={() => {}} />);
    expect(button.getAttribute("role")).toBe("button");
    expect(button.tabIndex).toBe(0);
  });

  it("is a plain div without an onClick handler", () => {
    const div = render(<WinampButton className="band" />);
    expect(div.hasAttribute("role")).toBe(false);
    expect(div.hasAttribute("tabindex")).toBe(false);
  });

  it("is activated by Enter and Space", () => {
    const onClick = vi.fn();
    const button = render(<WinampButton title="Play" onClick={onClick} />);
    expect(keyDown(button, "Enter").defaultPrevented).toBe(true);
    expect(keyDown(button, " ").defaultPrevented).toBe(true);
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("ignores other keys and key repeat", () => {
    const onClick = vi.fn();
    const button = render(<WinampButton title="Play" onClick={onClick} />);
    expect(keyDown(button, "a").defaultPrevented).toBe(false);
    keyDown(button, "Enter", { repeat: true });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("ignores keys from focusable descendants", () => {
    const onClick = vi.fn();
    render(
      <WinampButton title="Play" onClick={onClick}>
        <input />
      </WinampButton>
    );
    keyDown(container.querySelector("input")!, "Enter");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("still calls a provided onKeyDown handler", () => {
    const onKeyDown = vi.fn();
    const button = render(
      <WinampButton title="Play" onClick={() => {}} onKeyDown={onKeyDown} />
    );
    keyDown(button, "a");
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
});

describe("ClickedDiv", () => {
  it("is marked as clicked when activated from the keyboard", () => {
    const onClick = vi.fn();
    const button = render(
      <ClickedDiv id="close" title="Close" onClick={onClick} />
    );
    expect(button.classList.contains("clicked")).toBe(false);
    keyDown(button, "Enter");
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button.classList.contains("clicked")).toBe(true);
  });

  it("is not a button without an onClick handler", () => {
    const div = render(<ClickedDiv id="option" title="Winamp Menu" />);
    expect(div.hasAttribute("role")).toBe(false);
  });
});
