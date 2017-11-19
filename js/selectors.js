import { denormalize, getTimeStr, clamp } from "./utils";
import { BANDS } from "./constants";
import { createSelector } from "reselect";

export const getEqfData = state => {
  const { sliders } = state.equalizer;
  const preset = {
    name: "Entry1",
    preamp: denormalize(sliders.preamp)
  };
  BANDS.forEach(band => {
    preset[`hz${band}`] = denormalize(sliders[band]);
  });
  const eqfData = {
    presets: [preset],
    type: "Winamp EQ library file v1.1"
  };
  return eqfData;
};

const getTracks = state => state.tracks;
const getTrackOrder = state => state.playlist.trackOrder;

export const getOrderedTracks = createSelector(
  getTracks,
  getTrackOrder,
  (tracks, trackOrder) => trackOrder.filter(id => tracks[id])
);

const getOrderedTrackObjects = createSelector(
  getTracks,
  getOrderedTracks,
  (tracks, trackOrder) => trackOrder.map(id => tracks[id])
);

const getSelectedTrackObjects = createSelector(getOrderedTrackObjects, tracks =>
  tracks.filter(track => track.selected)
);

const runningTimeFromTracks = tracks =>
  tracks.reduce((time, track) => time + Number(track.duration), 0);

const getTotalRunningTime = createSelector(
  getOrderedTrackObjects,
  runningTimeFromTracks
);

const getSelectedRunningTime = createSelector(
  getSelectedTrackObjects,
  runningTimeFromTracks
);

// Note: We should append "+" to these values if some of the tracks are of unknown time.
export const getRunningTimeMessage = createSelector(
  getTotalRunningTime,
  getSelectedRunningTime,
  (totalRunningTime, selectedRunningTime) =>
    `${getTimeStr(selectedRunningTime)}/${getTimeStr(totalRunningTime)}`
);

export const nextTrack = (state, n = 1) => {
  const { playlist: { trackOrder, currentTrack }, media: { repeat } } = state;
  if (trackOrder.length === 0) {
    return null;
  }

  const currentIndex = trackOrder.findIndex(
    trackId => trackId === currentTrack
  );

  let nextIndex = currentIndex + n;
  if (repeat) {
    nextIndex = nextIndex % trackOrder.length;
    if (nextIndex < 0) {
      // Handle wrapping around backwards
      nextIndex += trackOrder.length;
    }
    return trackOrder[nextIndex];
  }

  if (currentIndex === trackOrder.length - 1 && n > 0) {
    return null;
  } else if (currentIndex === 0 && n < 0) {
    return null;
  }

  nextIndex = clamp(nextIndex, 0, trackOrder.length - 1);
  return trackOrder[nextIndex];
};
