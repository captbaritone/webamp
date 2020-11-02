import { Node } from "../ContextMenu";
import ContextMenuTarget from "../ContextMenuTarget";
import * as Actions from "../../actionCreators";
import { useActionCreator } from "../../hooks";

const MiscOptionsContextMenu = () => {
  const downloadHtmlPlaylist = useActionCreator(Actions.downloadHtmlPlaylist);
  return (
    <ContextMenuTarget
      top
      renderMenu={() => (
        <Node onClick={downloadHtmlPlaylist} label="Generate HTML playlist" />
      )}
    >
      <div />
    </ContextMenuTarget>
  );
};

export default MiscOptionsContextMenu;
