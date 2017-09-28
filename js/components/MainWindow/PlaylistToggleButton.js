import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import {
  TOGGLE_PLAYLIST_WINDOW,
  SET_USER_MESSAGE,
  UNSET_USER_MESSAGE
} from "../../actionTypes";

const PlaylistToggleButton = props => (
  <div
    id="playlist-button"
    className={classnames({ selected: props.playlist })}
    onClick={props.handleClick}
    onMouseDown={props.handleMouseDown}
    onMouseUp={props.handleMouseUp}
    title="Toggle Playlist Editor"
  />
);

const mapStateToProps = state => ({
  playlist: state.windows.playlist
});

const mapDispatchToProps = {
  handleClick: () => ({ type: TOGGLE_PLAYLIST_WINDOW }),
  handleMouseDown: () => ({
    type: SET_USER_MESSAGE,
    message: "Playlist not yet implemented"
  }),
  handleMouseUp: () => ({
    type: UNSET_USER_MESSAGE
  })
};

export default connect(mapStateToProps, mapDispatchToProps)(
  PlaylistToggleButton
);
