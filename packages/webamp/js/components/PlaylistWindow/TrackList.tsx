import { useState, useEffect } from "react";

import * as Selectors from "../../selectors";
import { TRACK_HEIGHT } from "../../constants";
import * as Actions from "../../actionCreators";
import TrackCell from "./TrackCell";
import TrackTitle from "./TrackTitle";
import { useTypedSelector, useActionCreator } from "../../hooks";
import * as Utils from "../../utils";

function getNumberLength(number: number): number {
  return number.toString().length;
}

function TrackList() {
  const offset = useTypedSelector(Selectors.getScrollOffset);
  const trackIds = useTypedSelector(Selectors.getVisibleTrackIds);
  const tracks = useTypedSelector(Selectors.getTracks);
  const numberOfTracks = useTypedSelector(Selectors.getNumberOfTracks);

  const selectZero = useActionCreator(Actions.selectZero);
  const dragSelected = useActionCreator(Actions.dragSelected);
  const scrollPlaylistByDelta = useActionCreator(Actions.scrollPlaylistByDelta);

  const [node, setNode] = useState<HTMLElement | null>(null);
  const [moving, setMoving] = useState(false);
  const [mouseStartY, setMouseStartY] = useState<number | null>(null);

  const _handleMoveClick = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    setMoving(true);
    setMouseStartY(Utils.getY(e));
  };

  useEffect(() => {
    if (node == null || mouseStartY == null || moving === false) {
      return;
    }
    const { top, bottom, left, right } = node.getBoundingClientRect();
    let lastDiff = 0;
    const handleMouseMove = (ee: MouseEvent | TouchEvent) => {
      const x = Utils.getX(ee);
      const y = Utils.getY(ee);
      if (y < top || y > bottom || x < left || x > right) {
        // Mouse is outside the track list
        return;
      }
      const proposedDiff = Math.floor((y - mouseStartY) / TRACK_HEIGHT);
      if (proposedDiff !== lastDiff) {
        const diffDiff = proposedDiff - lastDiff;
        dragSelected(diffDiff);
        lastDiff = proposedDiff;
      }
    };

    // A little indirect here. Basically, we set `moving` false here which
    // causes our useEffect to rerun which removes all of these event listeners.
    // It might be a little tigher to actually remove these listeners in the
    // `handleMouseUp` callback, but... I'm lazy.
    const handleMouseUp = () => setMoving(false);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchend", handleMouseUp);
    window.addEventListener("touchmove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
    // I'm not 100% sure how well this would work if it rebound mid drag, so
    // we'll just pretend it's okay that we have stale values in there.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moving]);

  function _renderTracks(
    format: (id: number, i: number) => JSX.Element | string
  ) {
    return trackIds.map((id, i) => (
      <TrackCell
        key={id}
        id={id}
        index={offset + i}
        handleMoveClick={_handleMoveClick}
      >
        {format(id, i)}
      </TrackCell>
    ));
  }

  const maxTrackNumberLength = getNumberLength(numberOfTracks);
  const paddedTrackNumForIndex = (i: number) =>
    (i + 1 + offset).toString().padStart(maxTrackNumberLength, "\u00A0");

  useEffect(() => {
    if (node == null) {
      return;
    }

    // Chome changed wheel events to be passive be default. We need active (so
    // we can prevent default) and React does not have a way to control this, so
    // we must bind our own events.
    //
    // https://github.com/facebook/react/issues/14856#issuecomment-806052402
    node.addEventListener("wheel", scrollPlaylistByDelta, { passive: false });

    return () => {
      node.removeEventListener("wheel", scrollPlaylistByDelta);
    };
  }, [node, scrollPlaylistByDelta]);
  return (
    <div
      ref={setNode}
      className="playlist-tracks"
      style={{ height: "100%", userSelect: "none" }}
      onClick={selectZero}
    >
      <div className="playlist-track-titles">
        {_renderTracks((id, i) => (
          <TrackTitle id={id} paddedTrackNumber={paddedTrackNumForIndex(i)} />
        ))}
      </div>
      <div className="playlist-track-durations">
        {_renderTracks((id) => Utils.getTimeStr(tracks[id].duration))}
      </div>
    </div>
  );
}

export default TrackList;
