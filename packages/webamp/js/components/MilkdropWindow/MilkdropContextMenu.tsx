import { ReactNode } from "react";
import { Hr, Node } from "../ContextMenu";
import { WINDOWS } from "../../constants";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import ContextMenuWraper from "../ContextMenuWrapper";
import { useTypedSelector, useActionCreator } from "../../hooks";

interface Props {
  children: ReactNode;
}

const MilkdropContextMenu = (props: Props) => {
  const desktop = useTypedSelector(Selectors.getMilkdropDesktopEnabled);

  const closeWindow = useActionCreator(Actions.closeWindow);
  const toggleDesktop = useActionCreator(Actions.toggleMilkdropDesktop);
  const toggleFullscreen = useActionCreator(Actions.toggleMilkdropFullscreen);
  return (
    <ContextMenuWraper
      renderContents={() => {
        return (
          <>
            <Node
              onClick={toggleFullscreen}
              label="Fullscreen"
              hotkey="Alt+Enter"
            />
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
    </ContextMenuWraper>
  );
};

export default MilkdropContextMenu;
