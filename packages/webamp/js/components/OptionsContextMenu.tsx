import { Hr, Node } from "./ContextMenu";
import SkinsContextMenu from "./SkinsContextMenu";
import * as Actions from "../actionCreators";
import * as Selectors from "../selectors";
import { TIME_MODE } from "../constants";
import { useActionCreator, useTypedSelector } from "../hooks";

const OptionsContextMenu = () => {
  const toggleTimeMode = useActionCreator(Actions.toggleTimeMode);
  const toggleDoubleSizeMode = useActionCreator(Actions.toggleDoubleSizeMode);
  const toggleRepeat = useActionCreator(Actions.toggleRepeat);
  const toggleShuffle = useActionCreator(Actions.toggleShuffle);

  const doubled = useTypedSelector(Selectors.getDoubled);
  const timeMode = useTypedSelector(Selectors.getTimeMode);
  const repeat = useTypedSelector(Selectors.getRepeat);
  const shuffle = useTypedSelector(Selectors.getShuffle);
  return (
    <>
      {/* <Node label="Preferences..." /> */}
      <SkinsContextMenu />
      <Hr />
      <Node
        label="Time elapsed"
        hotkey="(Ctrl+T toggles)"
        onClick={toggleTimeMode}
        checked={timeMode === TIME_MODE.ELAPSED}
      />
      <Node
        label="Time remaining"
        hotkey="(Ctrl+T toggles)"
        onClick={toggleTimeMode}
        checked={timeMode === TIME_MODE.REMAINING}
      />
      {/* <Node label="Always On Top" hotkey="Ctrl+A" /> */}
      <Node
        label="Double Size"
        hotkey="Ctrl+D"
        onClick={toggleDoubleSizeMode}
        checked={doubled}
      />
      {/* <Node label="EasyMove" hotkey="Ctrl+E" /> */}
      <Hr />
      <Node label="Repeat" hotkey="R" onClick={toggleRepeat} checked={repeat} />
      <Node
        label="Shuffle"
        hotkey="S"
        onClick={toggleShuffle}
        checked={shuffle}
      />
    </>
  );
};
export default OptionsContextMenu;
