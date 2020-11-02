import { memo, Fragment, useEffect } from "react";
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

const MainContextMenu = memo(({ filePickers }: Props) => {
  const networkConnected = useTypedSelector(Selectors.getNetworkConnected);
  const genWindows = useTypedSelector(Selectors.getGenWindows);

  const close = useActionCreator(Actions.close);
  const openMediaFileDialog = useActionCreator(Actions.openMediaFileDialog);
  const loadMediaFiles = useActionCreator(Actions.loadMediaFiles);
  const toggleWindow = useActionCreator(Actions.toggleWindow);
  const menuOpened = useActionCreator(() => ({
    type: "MAIN_CONTEXT_MENU_OPENED",
  }));
  useEffect(() => {
    menuOpened();
  }, [menuOpened]);

  return (
    <Fragment>
      <LinkNode
        href="https://webamp.org/about"
        target="_blank"
        label="Webamp..."
      />
      <Hr />
      <Parent label="Play">
        <Node onClick={openMediaFileDialog} label="File..." hotkey="L" />
        {filePickers != null &&
          filePickers.map(
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
    </Fragment>
  );
});

export default MainContextMenu;
