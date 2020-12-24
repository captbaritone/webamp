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

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
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
    const handleOffset = handleNode.contains(e.target as HTMLElement)
      ? e.clientY - handleTop
      : realHandleHeight / 2;

    const baseOffset = sliderTop + handleOffset;
    // Measure the actual rect height rather than use the `height` prop, becuase
    // we might be in double-size mode.
    const spanSize = sliderHeight - realHandleHeight;

    function moveToCursor(event: MouseEvent) {
      // Ensure dragging does not cause elements/text to be selected.
      // https://stackoverflow.com/a/19164149/1263117
      event.preventDefault();
      const startOffset = event.clientY - baseOffset;
      onChange(Utils.clamp(startOffset / spanSize, 0, 1));
    }

    function handleMouseUp() {
      if (onAfterChange != null) {
        onAfterChange();
      }
      document.removeEventListener("mousemove", moveToCursor);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    document.addEventListener("mousemove", moveToCursor);
    document.addEventListener("mouseup", handleMouseUp);

    if (onBeforeChange != null) {
      onBeforeChange();
    }

    // Move the slider to where they've started.
    moveToCursor(e.nativeEvent);
  }
  const offset = Math.floor((height - handleHeight) * value);
  return (
    <div
      style={{ height, width }}
      onMouseDown={disabled ? undefined : handleMouseDown}
      ref={ref}
    >
      <div style={{ transform: `translateY(${offset}px)` }} ref={handleRef}>
        {handle}
      </div>
    </div>
  );
}
