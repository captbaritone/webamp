import React from "react";
import { connect } from "react-redux";

import { getTimeStr } from "../../utils";
import { getVisibleTrackIds, getScrollOffset } from "../../selectors";
import { TRACK_HEIGHT } from "../../constants";
import { SELECT_ZERO } from "../../actionTypes";
import { dragSelected, scrollPlaylistByDelta } from "../../actionCreators";
import TrackCell from "./TrackCell";
import TrackTitle from "./TrackTitle";

class TrackList extends React.Component {
  constructor(props) {
    super(props);
    this._handleMoveClick = this._handleMoveClick.bind(this);
  }

  _renderTracks(format) {
    return this.props.trackIds.map((id, i) => (
      <TrackCell
        key={id}
        id={id}
        index={this.props.offset + i}
        handleMoveClick={this._handleMoveClick}
      >
        {format(id, i)}
      </TrackCell>
    ));
  }

  _handleMoveClick(e) {
    if (!this._node) {
      return;
    }
    const { top, bottom, left, right } = this._node.getBoundingClientRect();
    const mouseStart = e.clientY;
    let lastDiff = 0;
    const handleMouseMove = ee => {
      const { clientY: y, clientX: x } = ee;
      if (y < top || y > bottom || x < left || x > right) {
        // Mouse is outside the track list
        return;
      }
      const proposedDiff = Math.floor((y - mouseStart) / TRACK_HEIGHT);
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

  render() {
    const { tracks, offset } = this.props;
    return (
      <div
        ref={node => {
          this._node = node;
        }}
        className="playlist-tracks"
        style={{ height: "100%" }}
        onClick={this.props.selectZero}
        onWheel={this.props.scrollPlaylistByDelta}
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
  selectZero: () => ({ type: SELECT_ZERO }),
  dragSelected,
  scrollPlaylistByDelta
};

const mapStateToProps = state => ({
  offset: getScrollOffset(state),
  trackIds: getVisibleTrackIds(state),
  tracks: state.playlist.tracks
});

export default connect(mapStateToProps, mapDispatchToProps)(TrackList);
