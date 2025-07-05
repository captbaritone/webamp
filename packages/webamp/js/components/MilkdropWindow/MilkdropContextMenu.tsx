import { ReactNode } from "react";
import { Hr, Node } from "../ContextMenu";
import { WINDOWS } from "../../constants";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import ContextMenuWrapper from "../ContextMenuWrapper";
import { useTypedSelector, useActionCreator } from "../../hooks";
import fscreen from "fscreen";

interface Props {
  children: ReactNode;
}

const MilkdropContextMenu = (props: Props) => {
  const desktop = useTypedSelector(Selectors.getMilkdropDesktopEnabled);

  const closeWindow = useActionCreator(Actions.closeWindow);
  const toggleDesktop = useActionCreator(Actions.toggleMilkdropDesktop);
  const toggleFullscreen = useActionCreator(Actions.toggleMilkdropFullscreen);

  return (
    <ContextMenuWrapper
      renderContents={() => {
        return (
          <>
            {fscreen.fullscreenEnabled && (
              <Node
                onClick={toggleFullscreen}
                label="Fullscreen"
                hotkey="Alt+Enter"
              />
            )}
            <Node
              onClick={toggleDesktop}
              checked={desktop}
              label="Desktop Mode"
              hotkey="Alt+D"
            />
            <Hr />
            <Node onClick={() => closeWindow(WINDOWS.MILKDROP)} label="Quit" />
          </>
        );
      }}
    >
      {props.children}
    </ContextMenuWrapper>
  );
};

export default MilkdropContextMenu;
