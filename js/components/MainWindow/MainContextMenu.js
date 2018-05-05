import React from "react";
import { connect } from "react-redux";
import {
  close,
  setSkinFromUrl,
  openMediaFileDialog,
  loadMediaFiles,
  openSkinFileDialog
} from "../../actionCreators";
import {
  TOGGLE_MAIN_WINDOW,
  TOGGLE_EQUALIZER_WINDOW,
  TOGGLE_PLAYLIST_WINDOW,
  TOGGLE_GEN_WINDOW
} from "../../actionTypes";
import { getGenWindows } from "../../selectors";
import { LOAD_STYLE } from "../../constants";
import { Hr, Node, Parent, LinkNode } from "../ContextMenu";

const MainContextMenu = props => (
  <React.Fragment>
    <LinkNode
      href="https://github.com/captbaritone/webamp"
      target="_blank"
      label="Webamp..."
    />
    <Hr />
    <Parent label="Play">
      <Node onClick={props.openMediaFileDialog} label="File..." hotkey="L" />
      {props.filePickers &&
        props.filePickers.map(
          (picker, i) =>
            (props.networkConnected || !picker.requiresNetwork) && (
              <Node
                key={i}
                onClick={async () => {
                  let files;
                  try {
                    files = await picker.filePicker();
                  } catch (e) {
                    console.error("Error loading from file picker", e);
                  }
                  props.loadMediaFiles(files, LOAD_STYLE.PLAY);
                }}
                label={picker.contextMenuName}
              />
            )
        )}
    </Parent>
    <Hr />
    <Node
      label="Main Window"
      checked={props.mainWindowOpen}
      onClick={props.toggleMainWindow}
      hotkey="Alt+W"
    />
    <Node
      label="Playlist Editor"
      checked={props.playlistOpen}
      onClick={props.togglePlaylist}
      hotkey="Alt+E"
    />
    <Node
      label="Equalizer"
      checked={props.equalizerOpen}
      onClick={props.toggleEqualizer}
      hotkey="Alt+G"
    />
    {Object.keys(props.genWindows).map(i => (
      <Node
        key={i}
        label={props.genWindows[i].title}
        checked={props.genWindows[i].open}
        onClick={() => props.toggleGenWindow(i)}
      />
    ))}
    <Hr />
    <Parent label="Skins">
      <Node onClick={props.openSkinFileDialog} label="Load Skin..." />
      {!!props.availableSkins.length && <Hr />}
      {props.availableSkins.map(skin => (
        <Node
          key={skin.url}
          onClick={() => props.setSkin(skin.url)}
          label={skin.name}
        />
      ))}
    </Parent>
    <Hr />
    <Node onClick={props.close} label="Exit" />
  </React.Fragment>
);

const mapStateToProps = state => ({
  availableSkins: state.settings.availableSkins,
  networkConnected: state.network.connected,
  mainWindowOpen: state.windows.mainWindow, // For now you can't close the main window without closing all of Webamp
  playlistOpen: state.windows.playlist,
  equalizerOpen: state.windows.equalizer,
  genWindows: getGenWindows(state)
});

const mapDispatchToProps = {
  close,
  openSkinFileDialog,
  openMediaFileDialog,
  loadMediaFiles,
  setSkin: setSkinFromUrl,
  toggleMainWindow: () => ({ type: TOGGLE_MAIN_WINDOW }),
  togglePlaylist: () => ({ type: TOGGLE_PLAYLIST_WINDOW }),
  toggleEqualizer: () => ({ type: TOGGLE_EQUALIZER_WINDOW }),
  toggleGenWindow: windowId => ({ type: TOGGLE_GEN_WINDOW, windowId })
};

export default connect(mapStateToProps, mapDispatchToProps)(MainContextMenu);
