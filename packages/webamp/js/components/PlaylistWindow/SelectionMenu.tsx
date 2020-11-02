import PlaylistMenu from "./PlaylistMenu";
import * as Actions from "../../actionCreators";
import { useActionCreator } from "../../hooks";

export default function SelectionMenu() {
  const invert = useActionCreator(Actions.invertSelection);
  const zero = useActionCreator(Actions.selectZero);
  const all = useActionCreator(Actions.selectAll);
  return (
    <PlaylistMenu id="playlist-selection-menu">
      <div className="invert-selection" onClick={invert} />
      <div className="select-zero" onClick={zero} />
      <div className="select-all" onClick={all} />
    </PlaylistMenu>
  );
}
