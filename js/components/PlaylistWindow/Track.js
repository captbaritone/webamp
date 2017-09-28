import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { getTimeStr } from "../../utils";

const Track = props => {
  const {
    skinPlaylistStyle,
    selected,
    current,
    title,
    number,
    duration
  } = props;
  const style = {
    backgroundColor: selected ? skinPlaylistStyle.SelectedBG : null,
    color: current ? skinPlaylistStyle.Current : null
  };
  return (
    <div
      className={classnames("playlist-track", { selected, current })}
      style={style}
    >
      <div className="playlist-track-number">{number}.</div>
      <div className="playlist-track-title">
        <span>{title}</span>
      </div>
      <div className="playlist-track-duration">{getTimeStr(duration)}</div>
    </div>
  );
};

const mapDispatchToProps = (dispatch, ownProps) => ({});

const mapStateToProps = state => {
  const { display: { skinPlaylistStyle } } = state;
  return { skinPlaylistStyle };
};

export default connect(mapStateToProps, mapDispatchToProps)(Track);
