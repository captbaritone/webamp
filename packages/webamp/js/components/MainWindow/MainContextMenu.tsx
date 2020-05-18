import React from "react";
import * as Actions from "../../actionCreators";
import * as Selectors from "../../selectors";
import { LOAD_STYLE } from "../../constants";
import { Hr, Node, Parent, LinkNode } from "../ContextMenu";
import PlaybackContextMenu from "../PlaybackContextMenu";
import OptionsContextMenu from "../OptionsContextMenu";
import SkinsContextMenu from "../SkinsContextMenu";
import { FilePicker } from "../../types";
import { useTypedSelector, useActionCreator } from "../../hooks";

interface Props {
  filePickers: FilePicker[];
}

const MainContextMenu = React.memo((props: Props) => {
  const networkConnected = useTypedSelector(Selectors.getNetworkConnected);
  const genWindows = useTypedSelector(Selectors.getGenWindows);

  const close = useActionCreator(Actions.close);
  const openMediaFileDialog = useActionCreator(Actions.openMediaFileDialog);
  const loadMediaFiles = useActionCreator(Actions.loadMediaFiles);
  const toggleWindow = useActionCreator(Actions.toggleWindow);

  return (
    <React.Fragment>
      <LinkNode
        href="https://webamp.org/about"
        target="_blank"
        label="Webamp..."
      />
      <Hr />
      <Parent label="Play">
        <Node onClick={openMediaFileDialog} label="File..." hotkey="L" />
        {props.filePickers &&
          props.filePickers.map(
            (picker, i) =>
              (networkConnected || !picker.requiresNetwork) && (
                <Node
                  key={i}
                  onClick={async () => {
                    let files;
                    try {
                      files = await picker.filePicker();
                    } catch (e) {
                      console.error("Error loading from file picker", e);
                    }
                    loadMediaFiles(files || [], LOAD_STYLE.PLAY);
                  }}
                  label={picker.contextMenuName}
                />
              )
          )}
      </Parent>
      <Hr />
      {Object.keys(genWindows).map((i) => (
        <Node
          key={i}
          label={genWindows[i].title}
          checked={genWindows[i].open}
          onClick={() => toggleWindow(i)}
          hotkey={genWindows[i].hotkey}
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
      <Node onClick={close} label="Exit" />
    </React.Fragment>
  );
});

export default MainContextMenu;
