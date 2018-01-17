import React from "react";
import PropTypes from "prop-types";

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
        width + Math.round(x / this.props.resizeSegmentWidth)
      );

      const newHeight = this.props.widthOnly
        ? width
        : Math.max(0, height + Math.round(y / this.props.resizeSegmentHeight));

      const newSize = [newWidth, newHeight];

      this.props.setPlaylistSize(newSize);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", handleMove);
    });
  }

  render() {
    return (
      <div
        ref={node => (this.node = node)}
        id={this.props.id}
        onMouseDown={this.handleMouseDown}
      />
    );
  }
}

ResizeTarget.propTypes = {
  currentSize: PropTypes.arrayOf(PropTypes.number).isRequired,
  resizeSegmentWidth: PropTypes.number.isRequired,
  resizeSegmentHeight: PropTypes.number.isRequired,
  setPlaylistSize: PropTypes.func.isRequired,
  widthOnly: PropTypes.bool
};
