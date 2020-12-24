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
  disabled?: boolean;
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
  disabled,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);

  function registerMoveListener(target: HTMLElement, clientY: number) {
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

    // Mouse
    function handleMouseMove(event: MouseEvent) {
      event.preventDefault();
      moveToPosition(event.clientY);
    }

    function handleMouseUp() {
      if (onAfterChange != null) {
        onAfterChange();
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    // End Mouse

    // Touch
    function handleTouchMove(event: TouchEvent) {
      if (event.cancelable) {
        event.preventDefault();
      }
      moveToPosition(event.touches[0].clientY);
    }

    function handleTouchEnd() {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    }

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    // End Touch

    if (onBeforeChange != null) {
      onBeforeChange();
    }

    // Move the slider to where they've started.
    moveToPosition(clientY);
  }

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault();
    registerMoveListener(e.target as HTMLElement, e.clientY);
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    registerMoveListener(e.target as HTMLElement, e.touches[0].clientY);
  }

  const offset = Math.floor((height - handleHeight) * value);
  return (
    <div
      style={{ height, width }}
      onMouseDown={disabled ? undefined : handleMouseDown}
      onTouchStart={disabled ? undefined : handleTouchStart}
      ref={ref}
    >
      <div style={{ transform: `translateY(${offset}px)` }} ref={handleRef}>
        {handle}
      </div>
    </div>
  );
}
