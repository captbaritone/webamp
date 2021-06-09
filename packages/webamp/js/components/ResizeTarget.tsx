import { useState, useEffect, memo } from "react";
import {
  WINDOW_RESIZE_SEGMENT_WIDTH,
  WINDOW_RESIZE_SEGMENT_HEIGHT,
} from "../constants";
import * as Utils from "../utils";

type Size = [number, number];

interface Props {
  currentSize: Size;
  setWindowSize(size: Size): void;
  widthOnly?: boolean;
  id?: string;
}

function ResizeTarget(props: Props) {
  const { currentSize, setWindowSize, widthOnly, ...passThroughProps } = props;
  const [mouseDown, setMouseDown] = useState(false);
  const [mouseStart, setMouseStart] =
    useState<null | { x: number; y: number }>(null);
  useEffect(() => {
    if (mouseDown === false || mouseStart == null) {
      return;
    }
    const [width, height] = currentSize;
    const handleMove = (ee: MouseEvent | TouchEvent) => {
      const x = Utils.getX(ee) - mouseStart.x;
      const y = Utils.getY(ee) - mouseStart.y;

      const newWidth = Math.max(
        0,
        width + Math.round(x / WINDOW_RESIZE_SEGMENT_WIDTH)
      );

      const newHeight = widthOnly
        ? width
        : Math.max(0, height + Math.round(y / WINDOW_RESIZE_SEGMENT_HEIGHT));

      const newSize: Size = [newWidth, newHeight];

      props.setWindowSize(newSize);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);

    const handleMouseUp = () => setMouseDown(false);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
    // We pruposefully close over the props from when the mouse went down
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mouseStart, mouseDown]);

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    setMouseStart({
      x: Utils.getX(e),
      y: Utils.getY(e),
    });
    setMouseDown(true);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      {...passThroughProps}
    />
  );
}
export default memo(ResizeTarget);
