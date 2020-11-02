import { useState, useEffect } from "react";

import { getTimeStr } from "../../utils";
import * as Selectors from "../../selectors";
import { TRACK_HEIGHT } from "../../constants";
import * as Actions from "../../actionCreators";
import TrackCell from "./TrackCell";
import TrackTitle from "./TrackTitle";
import { useTypedSelector, useActionCreator } from "../../hooks";

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

  const [node, setNode] = useState<Element | null>(null);
  const [moving, setMoving] = useState(false);
  const [mouseStartY, setMouseStartY] = useState<number | null>(null);

  const _handleMoveClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setMoving(true);
    setMouseStartY(e.clientY);
  };

  useEffect(() => {
    if (node == null || mouseStartY == null || moving === false) {
      return;
    }
    const { top, bottom, left, right } = node.getBoundingClientRect();
    let lastDiff = 0;
    const handleMouseMove = (ee: MouseEvent) => {
      const { clientY: y, clientX: x } = ee;
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

    const handleMouseUp = () => setMoving(false);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
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
  return (
    <div
      ref={setNode}
      className="playlist-tracks"
      style={{ height: "100%" }}
      onClick={selectZero}
      onWheel={scrollPlaylistByDelta}
    >
      <div className="playlist-track-titles">
        {_renderTracks((id, i) => (
          <TrackTitle id={id} paddedTrackNumber={paddedTrackNumForIndex(i)} />
        ))}
      </div>
      <div className="playlist-track-durations">
        {_renderTracks((id) => getTimeStr(tracks[id].duration))}
      </div>
    </div>
  );
}

export default TrackList;
