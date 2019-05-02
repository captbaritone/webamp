import React from "react";
import { connect } from "react-redux";

import { getTimeStr } from "../../utils";
import {
  getVisibleTrackIds,
  getScrollOffset,
  getNumberOfTracks,
  getTracks,
} from "../../selectors";
import { TRACK_HEIGHT } from "../../constants";
import { SELECT_ZERO } from "../../actionTypes";
import { dragSelected, scrollPlaylistByDelta } from "../../actionCreators";
import TrackCell from "./TrackCell";
import TrackTitle from "./TrackTitle";
import { Dispatch, AppState } from "../../types";
import { TracksState } from "../../reducers/tracks";

interface DispatchProps {
  selectZero: () => void;
  scrollPlaylistByDelta: (e: React.WheelEvent<HTMLDivElement>) => void;
  dragSelected: (offset: number) => void;
}

interface StateProps {
  trackIds: number[];
  offset: number;
  numberOfTracks: number;
  tracks: TracksState;
}

function getNumberLength(number: number): number {
  return number.toString().length;
}

class TrackList extends React.Component<DispatchProps & StateProps> {
  _node?: HTMLDivElement | null;
  _renderTracks(format: (id: number, i: number) => JSX.Element | string) {
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

  _handleMoveClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!this._node) {
      return;
    }
    const { top, bottom, left, right } = this._node.getBoundingClientRect();
    const mouseStart = e.clientY;
    let lastDiff = 0;
    const handleMouseMove = (ee: MouseEvent) => {
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
  };

  _handleRef = (node: HTMLDivElement | null) => {
    this._node = node;
  };

  render() {
    const { tracks, offset } = this.props;
    const maxTrackNumberLength = getNumberLength(this.props.numberOfTracks);
    const paddedTrackNumForIndex = (i: number) =>
      (i + 1 + offset).toString().padStart(maxTrackNumberLength, "\u00A0");
    return (
      <div
        ref={this._handleRef}
        className="playlist-tracks"
        style={{ height: "100%" }}
        onClick={this.props.selectZero}
        onWheel={this.props.scrollPlaylistByDelta}
      >
        <div className="playlist-track-titles">
          {this._renderTracks((id, i) => (
            <TrackTitle id={id} paddedTrackNumber={paddedTrackNumForIndex(i)} />
          ))}
        </div>
        <div className="playlist-track-durations">
          {this._renderTracks(id => getTimeStr(tracks[id].duration))}
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  selectZero: () => dispatch({ type: SELECT_ZERO }),
  dragSelected: (offset: number) => dispatch(dragSelected(offset)),
  scrollPlaylistByDelta: (e: React.WheelEvent<HTMLDivElement>) =>
    dispatch(scrollPlaylistByDelta(e)),
});

const mapStateToProps = (state: AppState): StateProps => ({
  offset: getScrollOffset(state),
  trackIds: getVisibleTrackIds(state),
  tracks: getTracks(state),
  numberOfTracks: getNumberOfTracks(state),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TrackList);
