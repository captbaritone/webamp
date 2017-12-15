import {
  IS_PLAYING,
  IS_STOPPED,
  PAUSE,
  PLAY,
  SEEK_TO_PERCENT_COMPLETE,
  SET_BAND_VALUE,
  SET_BALANCE,
  SET_MEDIA,
  SET_VOLUME,
  START_WORKING,
  STOP,
  STOP_WORKING,
  UPDATE_TIME_ELAPSED,
  SET_EQ_OFF,
  SET_EQ_ON,
  PLAY_TRACK,
  BUFFER_TRACK
} from "./actionTypes";
import { next as nextTrack } from "./actionCreators";
import { getCurrentTrackId } from "./selectors";

export default media => store => {
  const { media: { volume, balance } } = store.getState();

  // Ensure the default state is the canonical value.
  media.setVolume(volume);
  media.setBalance(balance);
  // TODO: Ensure other values like bands and preamp are in sync

  media.addEventListener("timeupdate", () => {
    store.dispatch({
      type: UPDATE_TIME_ELAPSED,
      elapsed: media.timeElapsed()
    });
  });

  media.addEventListener("ended", () => {
    store.dispatch({ type: IS_STOPPED });
    store.dispatch(nextTrack());
  });

  media.addEventListener("playing", () => {
    store.dispatch({ type: IS_PLAYING });
  });

  media.addEventListener("waiting", () => {
    store.dispatch({ type: START_WORKING });
  });

  media.addEventListener("stopWaiting", () => {
    store.dispatch({ type: STOP_WORKING });
  });

  media.addEventListener("fileLoaded", () => {
    store.dispatch({
      type: SET_MEDIA,
      kbps: "128",
      khz: Math.round(media.sampleRate() / 1000).toString(),
      channels: media.channels(),
      length: media.duration(),
      id: getCurrentTrackId(store.getState())
    });
  });

  return next => action => {
    // TODO: Consider doing this after the action, and using the state as the source of truth.
    switch (action.type) {
      case PLAY:
        media.play();
        break;
      case PAUSE:
        media.pause();
        break;
      case STOP:
        media.stop();
        break;
      case SET_VOLUME:
        media.setVolume(action.volume);
        break;
      case SET_BALANCE:
        media.setBalance(action.balance);
        break;
      case SEEK_TO_PERCENT_COMPLETE:
        media.seekToPercentComplete(action.percent);
        break;
      case PLAY_TRACK:
        media.loadFromUrl(
          store.getState().playlist.tracks[action.id].url,
          action.name,
          true
        );
        break;
      case BUFFER_TRACK:
        media.loadFromUrl(
          store.getState().playlist.tracks[action.id].url,
          action.name,
          false
        );
        break;
      case SET_BAND_VALUE:
        if (action.band === "preamp") {
          media.setPreamp(action.value);
        } else {
          media.setEqBand(action.band, action.value);
        }
        break;
      case SET_EQ_OFF:
        media.disableEq();
        break;
      case SET_EQ_ON:
        media.enableEq();
        break;
    }
    return next(action);
  };
};
