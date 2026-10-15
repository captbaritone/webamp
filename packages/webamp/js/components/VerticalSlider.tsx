import * as Utils from "../utils";
import { ReactNode, useRef } from "react";

type Props = {
  height: number;
  width: number;
  handleHeight: number;
  value: number;
  handle: ReactNode;
  onBeforeChange?: () => void;
  onChange: (value: number) => void;
  onAfterChange?: () => void;
  requireClicksOriginateLocally?: boolean;
  disabled?: boolean;
  // If provided, the slider is exposed to keyboard and screen reader users as a
  // vertical `role="slider"` with this accessible name.
  label?: string;
  // Human readable version of the current value, e.g. "+3.0 dB".
  valueText?: string;
  // How far the arrow keys move the slider, as a fraction of its range.
  keyboardStep?: number;
};

const PAGE_STEP = 0.1;

type RegOptions = {
  target: HTMLElement;
  clientY: number;
};

// `<input type="range" />` can be rotated to become a vertical slider using
// CSS, but that makes it impossible to style the handle in a pixel perfect
// manner. Instead we reimplement it in React.
export default function VerticalSlider({
  value,
  height,
  width,
  handle,
  handleHeight,
  onBeforeChange,
  onChange,
  onAfterChange,
  requireClicksOriginateLocally = true,
  disabled,
  label,
  valueText,
  keyboardStep = 0.01,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);
  const keyboardChangeInProgress = useRef(false);

  function registerMoveListener({ target, clientY }: RegOptions) {
    const sliderNode = ref.current;
    const handleNode = handleRef.current;
    if (sliderNode == null || handleNode == null) {
      // I don't think this could ever happen in practice
      return null;
    }

    const sliderRect = sliderNode.getBoundingClientRect();
    const handleRect = handleNode.getBoundingClientRect();

    const { top: sliderTop, height: sliderHeight } = sliderRect;
    const { top: handleTop, height: realHandleHeight } = handleRect;

    // If the user clicks on the handle we want them to continue to hold onto
    // that point of te handle. If they click outside of the handle (in the
    // slider itself) we want to center the handle at that point and have them
    // move the handle from the center.
    const handleOffset = handleNode.contains(target as HTMLElement)
      ? clientY - handleTop
      : realHandleHeight / 2;

    const baseOffset = sliderTop + handleOffset;
    // Measure the actual rect height rather than use the `height` prop, becuase
    // we might be in double-size mode.
    const spanSize = sliderHeight - realHandleHeight;

    function moveToPosition(y: number) {
      // Ensure dragging does not cause elements/text to be selected.
      // https://stackoverflow.com/a/19164149/1263117
      const startOffset = y - baseOffset;
      onChange(Utils.clamp(startOffset / spanSize, 0, 1));
    }

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      moveToPosition(event.clientY);
    };
    const handleRelease = () => {
      if (onAfterChange != null) {
        onAfterChange();
      }
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handleRelease);
    };
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handleRelease);

    if (onBeforeChange != null) {
      onBeforeChange();
    }

    // Move the slider to where they've started.
    moveToPosition(clientY);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    registerMoveListener({
      target: e.target as HTMLElement,
      clientY: e.clientY,
    });
  }

  // We watch for events onPointerEnter only when requireClicksOriginateLocally === false
  // If the mouse/touch enters the Slider area, and the button/touch is already down, trigger a PointerDown
  function handlePointerEnter(e: React.PointerEvent<HTMLDivElement>) {
    if (e.buttons === 1) {
      handlePointerDown(e);
    }
  }

  // Note that `value` is the handle's offset from the top, so moving "up"
  // decreases it.
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    let newValue: number;
    switch (e.key) {
      case "ArrowUp":
      case "ArrowRight":
        newValue = value - keyboardStep;
        break;
      case "ArrowDown":
      case "ArrowLeft":
        newValue = value + keyboardStep;
        break;
      case "PageUp":
        newValue = value - PAGE_STEP;
        break;
      case "PageDown":
        newValue = value + PAGE_STEP;
        break;
      case "Home":
        newValue = 1;
        break;
      case "End":
        newValue = 0;
        break;
      default:
        return;
    }
    e.preventDefault();
    keyboardChangeInProgress.current = true;
    if (onBeforeChange != null) {
      onBeforeChange();
    }
    onChange(Utils.clamp(newValue, 0, 1));
  }

  function handleKeyUp() {
    if (!keyboardChangeInProgress.current) {
      return;
    }
    keyboardChangeInProgress.current = false;
    if (onAfterChange != null) {
      onAfterChange();
    }
  }

  const sliderProps =
    label == null
      ? {}
      : {
          role: "slider",
          tabIndex: disabled ? -1 : 0,
          "aria-label": label,
          "aria-orientation": "vertical" as const,
          "aria-valuemin": 0,
          "aria-valuemax": 100,
          "aria-valuenow": Math.round((1 - value) * 100),
          "aria-valuetext": valueText,
          "aria-disabled": disabled,
          onKeyDown: disabled ? undefined : handleKeyDown,
          onKeyUp: disabled ? undefined : handleKeyUp,
        };

  const offset = Math.floor((height - handleHeight) * value);
  return (
    <div
      {...sliderProps}
      style={{ height, width }}
      onPointerDown={disabled ? undefined : handlePointerDown}
      onPointerEnter={
        disabled || requireClicksOriginateLocally
          ? undefined
          : handlePointerEnter
      }
      ref={ref}
    >
      <div style={{ transform: `translateY(${offset}px)` }} ref={handleRef}>
        {handle}
      </div>
    </div>
  );
}
