import React from "react";
import { connect } from "react-redux";

import "../../css/playlist-window.css";

const PlaylistWindow = props => {
  const style = {};
  if (props) {
    style.color = props.Normal;
    style.backgroundColor = props.NormalBG;
  }
  return (
    <div id="playlist-window" className="window draggable" style={style}>
      <div className="playlist-left">
        <div className="playlist-right">
          <div className="playlist-top title-bar draggable">
            <div className="playlist-top-left draggable" />
            <div className="playlist-top-title draggable" />
            <div className="playlist-top-right draggable">
              <div id="close-playlist" />
              <div id="shade-playlist" />
            </div>
          </div>
          <div className="playlist-bottom">
            <div className="playlist-bottom-left" />
            <div className="playlist-visualizer" />
            <div className="playlist-bottom-right" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(state => state.display.skinPlaylistStyle)(
  PlaylistWindow
);
