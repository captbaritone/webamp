import { denormalize } from "./utils";
import { BANDS } from "./constants";
import { createSelector } from "reselect";

export const getEqfData = state => {
  // state.equalizer.sliders
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
