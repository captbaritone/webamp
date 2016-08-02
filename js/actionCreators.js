import MyFile from './my-file';

export function play(mediaPlayer) {
  return (dispatch, getState) => {
    if (getState().media.status === 'PLAYING') {
      mediaPlayer.stop();
      dispatch({type: 'SET_MEDIA_STATUS', status: 'STOPPED'});
    } else {
      mediaPlayer.play();
      dispatch({type: 'SET_MEDIA_STATUS', status: 'PLAYING'});
    }
  };
}

export function pause(mediaPlayer) {
  return (dispatch, getState) => {
    const status = getState().media.status;
    switch (status) {
      case 'PAUSED':
        mediaPlayer.play();
        dispatch({type: 'SET_MEDIA_STATUS', status: 'PLAYING'});
        break;
      case 'PLAYING':
        mediaPlayer.pause();
        dispatch({type: 'SET_MEDIA_STATUS', status: 'PAUSED'});
        break;
    }
  };
}

export function stop(mediaPlayer) {
  return (dispatch) => {
    mediaPlayer.stop();
    dispatch({type: 'SET_MEDIA_STATUS', status: 'STOPPED'});
  };
}

export function close(mediaPlayer) {
  return (dispatch) => {
    mediaPlayer.stop();
    dispatch({type: 'CLOSE_WINAMP'});
  };
}

export function setSkinFromFilename(winamp, filename) {
  const url = `https://cdn.rawgit.com/captbaritone/winamp-skins/master/v2/${filename}`;
  const skinFile = new MyFile();
  skinFile.setUrl(url);
  winamp.setSkin(skinFile);
  return {type: 'START_LOADING'};
}
