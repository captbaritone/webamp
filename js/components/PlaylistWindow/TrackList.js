import React from "react";
import { connect } from "react-redux";

import { getTimeStr } from "../../utils";
import { getVisibleTrackIds, getScrollOffset } from "../../selectors";
import { SELECT_ZERO } from "../../actionTypes";
import TrackCell from "./TrackCell";
import TrackTitle from "./TrackTitle";

class TrackList extends React.Component {
  constructor(props) {
    super(props);
  }

  _renderTracks(format) {
    return this.props.trackIds.map((id, i) => (
      <TrackCell key={id} id={id} index={i}>
        {format(id, i)}
      </TrackCell>
    ));
  }

  render() {
    const { tracks, offset } = this.props;
    return (
      <div
        className="playlist-tracks"
        style={{ height: "100%" }}
        onClick={this.props.selectZero}
      >
        <div className="playlist-track-numbers">
          {this._renderTracks((id, i) => `${i + 1 + offset}.`)}
        </div>
        <div className="playlist-track-titles">
          {this._renderTracks(id => <TrackTitle id={id} />)}
        </div>
        <div className="playlist-track-durations">
          {this._renderTracks(id => getTimeStr(tracks[id].duration))}
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  selectZero: () => ({ type: SELECT_ZERO })
};

const mapStateToProps = state => ({
  offset: getScrollOffset(state),
  trackIds: getVisibleTrackIds(state),
  tracks: state.playlist.tracks
});

export default connect(mapStateToProps, mapDispatchToProps)(TrackList);
