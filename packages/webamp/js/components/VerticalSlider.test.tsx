// @types/react is still on v18, which does not declare React 19's `act`.
// @ts-ignore
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import VerticalSlider from "./VerticalSlider";

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

type Props = Partial<Parameters<typeof VerticalSlider>[0]>;

function render(props: Props = {}): HTMLElement {
  act(() =>
    root.render(
      <VerticalSlider
        height={62}
        width={14}
        handleHeight={11}
        value={0.5}
        handle={<div />}
        onChange={() => {}}
        {...props}
      />
    )
  );
  return container.firstElementChild as HTMLElement;
}

function key(element: HTMLElement, type: "keydown" | "keyup", keyName: string) {
  const event = new KeyboardEvent(type, {
    key: keyName,
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    element.dispatchEvent(event);
  });
  return event;
}

describe("VerticalSlider", () => {
  it("is not exposed as a slider without a label", () => {
    const slider = render();
    expect(slider.hasAttribute("role")).toBe(false);
    expect(slider.hasAttribute("tabindex")).toBe(false);
  });

  it("is a focusable vertical slider with a label", () => {
    const slider = render({
      label: "60 Hz",
      valueText: "+6.0 dB",
      value: 0.25,
    });
    expect(slider.getAttribute("role")).toBe("slider");
    expect(slider.tabIndex).toBe(0);
    expect(slider.getAttribute("aria-label")).toBe("60 Hz");
    expect(slider.getAttribute("aria-orientation")).toBe("vertical");
    expect(slider.getAttribute("aria-valuemin")).toBe("0");
    expect(slider.getAttribute("aria-valuemax")).toBe("100");
    // `value` is the offset from the top, so a handle a quarter of the way down
    // is at 75%.
    expect(slider.getAttribute("aria-valuenow")).toBe("75");
    expect(slider.getAttribute("aria-valuetext")).toBe("+6.0 dB");
  });

  it("moves up and down with the arrow keys", () => {
    const onChange = vi.fn();
    const slider = render({ label: "60 Hz", onChange, keyboardStep: 0.25 });
    expect(key(slider, "keydown", "ArrowUp").defaultPrevented).toBe(true);
    key(slider, "keydown", "ArrowDown");
    key(slider, "keydown", "ArrowRight");
    key(slider, "keydown", "ArrowLeft");
    expect(onChange.mock.calls).toEqual([[0.25], [0.75], [0.25], [0.75]]);
  });

  it("supports PageUp, PageDown, Home and End", () => {
    const onChange = vi.fn();
    const slider = render({ label: "60 Hz", onChange });
    key(slider, "keydown", "PageUp");
    key(slider, "keydown", "PageDown");
    key(slider, "keydown", "Home");
    key(slider, "keydown", "End");
    expect(onChange.mock.calls).toEqual([[0.4], [0.6], [1], [0]]);
  });

  it("clamps keyboard changes to the slider's range", () => {
    const onChange = vi.fn();
    const slider = render({ label: "60 Hz", onChange, value: 0 });
    key(slider, "keydown", "ArrowUp");
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("ignores other keys", () => {
    const onChange = vi.fn();
    const slider = render({ label: "60 Hz", onChange });
    expect(key(slider, "keydown", "a").defaultPrevented).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("calls onBeforeChange and onAfterChange around keyboard changes", () => {
    const onBeforeChange = vi.fn();
    const onAfterChange = vi.fn();
    const slider = render({ label: "60 Hz", onBeforeChange, onAfterChange });
    // A key up without a preceding keyboard change, e.g. after tabbing here.
    key(slider, "keyup", "Tab");
    expect(onAfterChange).not.toHaveBeenCalled();
    key(slider, "keydown", "ArrowUp");
    expect(onBeforeChange).toHaveBeenCalledTimes(1);
    expect(onAfterChange).not.toHaveBeenCalled();
    key(slider, "keyup", "ArrowUp");
    expect(onAfterChange).toHaveBeenCalledTimes(1);
  });

  it("ignores the keyboard when disabled", () => {
    const onChange = vi.fn();
    const slider = render({ label: "60 Hz", onChange, disabled: true });
    expect(slider.tabIndex).toBe(-1);
    expect(slider.getAttribute("aria-disabled")).toBe("true");
    key(slider, "keydown", "ArrowUp");
    expect(onChange).not.toHaveBeenCalled();
  });
});
