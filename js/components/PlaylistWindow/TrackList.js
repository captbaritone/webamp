import React from "react";
import { connect } from "react-redux";

import { getTimeStr } from "../../utils";
import { getVisibleTrackIds } from "../../selectors";
import TrackCell from "./TrackCell";

const TrackList = props => {
  const { trackIds, tracks } = props;
  return (
    <div className="playlist-tracks">
      <div className="playlist-track-numbers">
        {trackIds.map((id, i) => (
          <TrackCell key={id} id={id}>
            {`${i + 1}.`}
          </TrackCell>
        ))}
      </div>
      <div className="playlist-track-titles">
        {trackIds.map(id => (
          <TrackCell key={id} id={id}>
            {tracks[id].title}
          </TrackCell>
        ))}
      </div>
      <div className="playlist-track-durations">
        {trackIds.map(id => (
          <TrackCell key={id} id={id}>
            {getTimeStr(tracks[id].duration)}
          </TrackCell>
        ))}
      </div>
    </div>
  );
};

const mapDispatchToProps = () => ({});

const mapStateToProps = state => ({
  trackIds: getVisibleTrackIds(state),
  tracks: state.tracks
});

export default connect(mapStateToProps, mapDispatchToProps)(TrackList);
