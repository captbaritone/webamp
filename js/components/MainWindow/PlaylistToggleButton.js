import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { getWindowOpen } from "../../selectors";
import { toggleWindow } from "../../actionCreators";

const PlaylistToggleButton = props => (
  <div
    id="playlist-button"
    className={classnames({ selected: props.playlist })}
    onClick={props.handleClick}
    title="Toggle Playlist Editor"
  />
);

const mapStateToProps = state => ({
  playlist: getWindowOpen(state, "playlist")
});

const mapDispatchToProps = {
  handleClick: () => toggleWindow("playlist")
};

export default connect(mapStateToProps, mapDispatchToProps)(
  PlaylistToggleButton
);
