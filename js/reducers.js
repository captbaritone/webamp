import MyFile from './my-file';

const createReducer = (winamp) => {

  const reducers = (state, action) => {
    if (!state) {
      return {
        contextMenu: {
          selected: false
        }
      };
    }
    switch (action.type) {
      case 'TOGGLE_CONTEXT_MENU':
        return Object.assign({}, state, {contextMenu: {selected: !state.contextMenu.selected}});
      case 'CLOSE_CONTEXT_MENU':
        return Object.assign({}, state, {contextMenu: {selected: false}});
      case 'CLOSE_WINAMP':
        winamp.close();
        return state;
      case 'OPEN_FILE_DIALOG':
        // TODO: Figure out how to make this pure
        winamp.openFileDialog();
        return state;
      case 'SET_SKIN_FROM_URL':
        // TODO: Figure out how to make this pure
        const skinFile = new MyFile();
        skinFile.setUrl(action.url);
        winamp.setSkin(skinFile);
        return state;
      default:
        return state;
    }
  };

  return reducers;
};

export default createReducer;
