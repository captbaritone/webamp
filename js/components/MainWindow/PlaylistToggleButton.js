import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { TOGGLE_PLAYLIST_WINDOW } from "../../actionTypes";

const PlaylistToggleButton = props => (
  <div
    id="playlist-button"
    className={classnames({ selected: props.playlist })}
    onClick={props.handleClick}
  />
);

const mapStateToProps = state => ({
  playlist: state.windows.playlist
});

const mapDispatchToProps = dispatch => ({
  handleClick: () => dispatch({ type: TOGGLE_PLAYLIST_WINDOW })
});

export default connect(mapStateToProps, mapDispatchToProps)(
  PlaylistToggleButton
);
