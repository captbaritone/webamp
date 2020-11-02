import { Fragment } from "react";
import * as Actions from "../actionCreators";
import { Hr, Node } from "./ContextMenu";
import { useActionCreator } from "../hooks";

const PlaybackContextMenu = () => {
  const previous = useActionCreator(Actions.previous);
  const play = useActionCreator(Actions.play);
  const pause = useActionCreator(Actions.pause);
  const stop = useActionCreator(Actions.stop);
  const next = useActionCreator(Actions.next);
  const seekForward = useActionCreator(Actions.seekForward);
  const seekBackward = useActionCreator(Actions.seekBackward);
  const nextN = useActionCreator(Actions.nextN);
  return (
    <Fragment>
      <Node label="Previous" hotkey="Z" onClick={previous} />
      <Node label="Play" hotkey="X" onClick={play} />
      <Node label="Pause" hotkey="C" onClick={pause} />
      <Node label="Stop" hotkey="V" onClick={stop} />
      <Node label="Next" hotkey="B" onClick={next} />
      <Hr />
      {/*
    <Node label="Stop w/ fadeout" hotkey="Shift+V" />
    <Node label="Stop after current" hotkey="Ctrl+V" />
    */}
      <Node
        label="Back 5 seconds"
        hotkey="Left"
        onClick={() => seekBackward(5)}
      />
      <Node
        label="Fwd 5 seconds"
        hotkey="Right"
        onClick={() => seekForward(5)}
      />
      {/*
    <Node label="Start of list" hotkey="Ctrl+Z" />
    */}
      <Node label="10 tracks back" hotkey="Num. 1" onClick={() => nextN(-10)} />
      <Node label="10 tracks fwd" hotkey="Num. 3" onClick={() => nextN(10)} />
      {/*
    <Hr />
    <Node label="Jump to time" hotkey="Ctrl+J" />
    <Node label="Jump to file" hotkey="J" />
    */}
    </Fragment>
  );
};

export default PlaybackContextMenu;
