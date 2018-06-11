import React from "react";
import PropTypes from "prop-types";
import {
  WINDOW_RESIZE_SEGMENT_WIDTH,
  WINDOW_RESIZE_SEGMENT_HEIGHT
} from "../constants";

export default class ResizeTarget extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseDown = this.handleMouseDown.bind(this);
  }

  handleMouseDown(e) {
    // Prevent dragging from highlighting text.
    e.preventDefault();
    const [width, height] = this.props.currentSize;
    const mouseStart = {
      x: e.clientX,
      y: e.clientY
    };

    const handleMove = ee => {
      const x = ee.clientX - mouseStart.x;
      const y = ee.clientY - mouseStart.y;

      const newWidth = Math.max(
        0,
        width + Math.round(x / WINDOW_RESIZE_SEGMENT_WIDTH)
      );

      const newHeight = this.props.widthOnly
        ? width
        : Math.max(0, height + Math.round(y / WINDOW_RESIZE_SEGMENT_HEIGHT));

      const newSize = [newWidth, newHeight];

      this.props.setWindowSize(newSize);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", handleMove);
    });
  }

  render() {
    /* eslint-disable no-unused-vars */
    const {
      currentSize,
      setWindowSize,
      widthOnly,
      ...passThroughProps
    } = this.props;
    /* eslint-enable no-unused-vars */
    return (
      <div
        ref={node => (this.node = node)}
        onMouseDown={this.handleMouseDown}
        {...passThroughProps}
      />
    );
  }
}

ResizeTarget.propTypes = {
  currentSize: PropTypes.arrayOf(PropTypes.number).isRequired,
  setWindowSize: PropTypes.func.isRequired,
  widthOnly: PropTypes.bool
};
