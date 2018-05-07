import React from "react";
import { connect } from "react-redux";
import {
  close,
  openMediaFileDialog,
  loadMediaFiles
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
import PlaybackContextMenu from "../PlaybackContextMenu";
import SkinsContextMenu from "../SkinsContextMenu";

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
    <SkinsContextMenu />
    <Hr />
    <Parent label="Playback">
      <PlaybackContextMenu />
    </Parent>
    <Hr />
    <Node onClick={props.close} label="Exit" />
  </React.Fragment>
);

const mapStateToProps = state => ({
  networkConnected: state.network.connected,
  mainWindowOpen: state.windows.mainWindow, // For now you can't close the main window without closing all of Webamp
  playlistOpen: state.windows.playlist,
  equalizerOpen: state.windows.equalizer,
  genWindows: getGenWindows(state)
});

const mapDispatchToProps = {
  close,
  openMediaFileDialog,
  loadMediaFiles,
  toggleMainWindow: () => ({ type: TOGGLE_MAIN_WINDOW }),
  togglePlaylist: () => ({ type: TOGGLE_PLAYLIST_WINDOW }),
  toggleEqualizer: () => ({ type: TOGGLE_EQUALIZER_WINDOW }),
  toggleGenWindow: windowId => ({ type: TOGGLE_GEN_WINDOW, windowId })
};

export default connect(mapStateToProps, mapDispatchToProps)(MainContextMenu);
