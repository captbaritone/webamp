import React from "react";
import { connect } from "react-redux";
import { PLAYLIST_SIZE_CHANGED } from "../../actionTypes";
import {
  PLAYLIST_RESIZE_SEGMENT_WIDTH,
  PLAYLIST_RESIZE_SEGMENT_HEIGHT
} from "../../constants";

class ResizeTarget extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseDown = this.handleMouseDown.bind(this);
  }
  handleMouseDown(e) {
    // Prevent dragging from highlighting text.
    e.preventDefault();
    const [width, height] = this.props.playlistSize;
    const mouseStart = {
      x: e.clientX,
      y: e.clientY
    };

    const handleMove = ee => {
      const x = ee.clientX - mouseStart.x;
      const y = ee.clientY - mouseStart.y;

      const newSize = [
        Math.max(0, width + Math.round(x / PLAYLIST_RESIZE_SEGMENT_WIDTH)),
        Math.max(0, height + Math.round(y / PLAYLIST_RESIZE_SEGMENT_HEIGHT))
      ];

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
        id="playlist-resize-target"
        onMouseDown={this.handleMouseDown}
      />
    );
  }
}

const mapStateToProps = state => ({
  playlistSize: state.display.playlistSize
});

const mapDispatchToProps = {
  setPlaylistSize: size => ({ type: PLAYLIST_SIZE_CHANGED, size })
};

export default connect(mapStateToProps, mapDispatchToProps)(ResizeTarget);
