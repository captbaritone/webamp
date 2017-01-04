import {
  IS_PLAYING,
  IS_STOPPED,
  PAUSE,
  PLAY,
  SET_BALANCE,
  SET_VOLUME,
  START_WORKING,
  STOP,
  STOP_WORKING,
  UPDATE_TIME_ELAPSED
} from './actionTypes';

export default (media) => (
  (store) => {
    media.addEventListener('timeupdate', () => {
      store.dispatch({type: UPDATE_TIME_ELAPSED, elapsed: media.timeElapsed()});
    });

    media.addEventListener('ended', () => {
      store.dispatch({type: IS_STOPPED});
    });

    media.addEventListener('playing', () => {
      store.dispatch({type: IS_PLAYING});
    });

    media.addEventListener('waiting', () => {
      store.dispatch({type: START_WORKING});
    });

    media.addEventListener('stopWaiting', () => {
      store.dispatch({type: STOP_WORKING});
    });

    return (next) => (action) => {
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
      }
      return next(action);
    };
  }
);
