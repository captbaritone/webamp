import React from "react";
import { connect } from "react-redux";
import {
  close,
  openMediaFileDialog,
  loadMediaFiles,
  toggleWindow,
} from "../../actionCreators";
import { getGenWindows } from "../../selectors";
import { LOAD_STYLE } from "../../constants";
import { Hr, Node, Parent, LinkNode } from "../ContextMenu";
import PlaybackContextMenu from "../PlaybackContextMenu";
import OptionsContextMenu from "../OptionsContextMenu";
import SkinsContextMenu from "../SkinsContextMenu";
import {
  AppState,
  Dispatch,
  Track,
  WindowId,
  FilePicker,
  LoadStyle,
} from "../../types";
import { WebampWindow } from "../../reducers/windows";

interface StateProps {
  networkConnected: boolean;
  genWindows: { [windowId: string]: WebampWindow };
}

interface DispatchProps {
  close(): void;
  openMediaFileDialog(): void;
  loadMediaFiles(tracks: Track[], loadStyle: LoadStyle): void;
  toggleGenWindow(windowId: WindowId): void;
}

interface OwnProps {
  filePickers: FilePicker[];
}

type Props = StateProps & DispatchProps & OwnProps;

const MainContextMenu = (props: Props) => (
  <React.Fragment>
    <LinkNode
      href="https://webamp.org/about"
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
                  props.loadMediaFiles(files || [], LOAD_STYLE.PLAY);
                }}
                label={picker.contextMenuName}
              />
            )
        )}
    </Parent>
    <Hr />
    {Object.keys(props.genWindows).map(i => (
      <Node
        key={i}
        label={props.genWindows[i].title}
        checked={props.genWindows[i].open}
        onClick={() => props.toggleGenWindow(i)}
        hotkey={props.genWindows[i].hotkey}
      />
    ))}
    <Hr />
    <SkinsContextMenu />
    <Hr />
    <Parent label="Options">
      <OptionsContextMenu />
    </Parent>
    <Parent label="Playback">
      <PlaybackContextMenu />
    </Parent>
    <Hr />
    <Node onClick={props.close} label="Exit" />
  </React.Fragment>
);

const mapStateToProps = (state: AppState): StateProps => ({
  networkConnected: state.network.connected,
  genWindows: getGenWindows(state),
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    close: () => dispatch(close()),
    openMediaFileDialog: () => dispatch(openMediaFileDialog()),
    loadMediaFiles: (tracks: Track[], loadStyle: LoadStyle) =>
      dispatch(loadMediaFiles(tracks, loadStyle)),
    toggleGenWindow: (windowId: WindowId) => dispatch(toggleWindow(windowId)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainContextMenu);
