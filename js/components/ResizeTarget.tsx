import React from "react";
import {
  WINDOW_RESIZE_SEGMENT_WIDTH,
  WINDOW_RESIZE_SEGMENT_HEIGHT,
} from "../constants";

type Size = [number, number];

interface Props {
  currentSize: Size;
  setWindowSize(size: Size): void;
  widthOnly?: boolean;
  id?: string;
}

export default class ResizeTarget extends React.Component<Props> {
  handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent dragging from highlighting text.
    e.preventDefault();
    const [width, height] = this.props.currentSize;
    const mouseStart = {
      x: e.clientX,
      y: e.clientY,
    };

    const handleMove = (ee: MouseEvent) => {
      const x = ee.clientX - mouseStart.x;
      const y = ee.clientY - mouseStart.y;

      const newWidth = Math.max(
        0,
        width + Math.round(x / WINDOW_RESIZE_SEGMENT_WIDTH)
      );

      const newHeight = this.props.widthOnly
        ? width
        : Math.max(0, height + Math.round(y / WINDOW_RESIZE_SEGMENT_HEIGHT));

      const newSize: Size = [newWidth, newHeight];

      this.props.setWindowSize(newSize);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", handleMove);
    });
  };

  render() {
    const {
      currentSize,
      setWindowSize,
      widthOnly,
      ...passThroughProps
    } = this.props;
    return <div onMouseDown={this.handleMouseDown} {...passThroughProps} />;
  }
}
