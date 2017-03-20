import {
  IS_PLAYING,
  IS_STOPPED,
  LOAD_AUDIO_URL,
  LOAD_AUDIO_FILE,
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
  TOGGLE_REPEAT,
  TOGGLE_SHUFFLE,
  UPDATE_TIME_ELAPSED
} from "./actionTypes";

export default media =>
  store => {
    media.addEventListener("timeupdate", () => {
      store.dispatch({
        type: UPDATE_TIME_ELAPSED,
        elapsed: media.timeElapsed()
      });
    });

    media.addEventListener("ended", () => {
      store.dispatch({ type: IS_STOPPED });
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
        name: media.name,
        length: media.duration()
      });
    });

    return next =>
      action => {
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
          case TOGGLE_REPEAT:
            media.toggleRepeat();
            break;
          case TOGGLE_SHUFFLE:
            media.toggleShuffle();
            break;
          case SEEK_TO_PERCENT_COMPLETE:
            media.seekToPercentComplete(action.percent);
            break;
          case LOAD_AUDIO_URL:
            media.loadFromUrl(action.url, action.name);
            break;
          case LOAD_AUDIO_FILE:
            media.loadFromFileReference(action.file.fileReference);
            break;
          case SET_BAND_VALUE:
            if (action.band === "preamp") {
              media.setPreamp(action.value);
            } else {
              media.setEqBand(action.band, action.value);
            }
            break;
        }
        return next(action);
      };
  };
