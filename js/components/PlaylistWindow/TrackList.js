import React from "react";
import { connect } from "react-redux";

import { getTimeStr } from "../../utils";
import { TRACK_HEIGHT } from "../../constants";
import { dragSelected} from "../../actionCreators";
import { getVisibleTrackIds, getScrollOffset } from "../../selectors";
import TrackCell from "./TrackCell";

class TrackList extends React.Component {
  constructor(props) {
    super(props);
    this._handleClick = this._handleClick.bind(this);
  }

  _handleClick(e) {
    const mouseStart = e.clientY;
    let lastDiff = 0;
    const handleMouseMove = ee => {
      const proposedDiff = Math.floor((ee.clientY - mouseStart) / TRACK_HEIGHT);
      if (proposedDiff !== lastDiff) {
        const diffDiff = proposedDiff - lastDiff;
        this.props.dragSelected(diffDiff);
        lastDiff = proposedDiff;
      }
    };

    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", handleMouseMove);
    });
    window.addEventListener("mousemove", handleMouseMove);
  }

  _renderTracks(format) {
    return this.props.trackIds.map((id, i) => (
      <TrackCell key={id} id={id} onMouseDown={this._handleClick}>
        {format(id, i)}
      </TrackCell>
    ));
  }

  render() {
    const { tracks, offset } = this.props;
    return (
      <div className="playlist-tracks">
        <div className="playlist-track-numbers">
          {this._renderTracks((id, i) => `${i + 1 + offset}.`)}
        </div>
        <div className="playlist-track-titles">
          {this._renderTracks(id => tracks[id].title)}
        </div>
        <div className="playlist-track-durations">
          {this._renderTracks(id => getTimeStr(tracks[id].duration))}
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  dragSelected
};

const mapStateToProps = state => ({
  offset: getScrollOffset(state),
  trackIds: getVisibleTrackIds(state),
  tracks: state.playlist.tracks
});

export default connect(mapStateToProps, mapDispatchToProps)(TrackList);
