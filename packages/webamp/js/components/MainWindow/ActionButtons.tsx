import { memo } from "react";
import * as Actions from "../../actionCreators";
import { useActionCreator } from "../../hooks";

const ActionButtons = memo(() => {
  const previous = useActionCreator(Actions.previous);
  const play = useActionCreator(Actions.play);
  const pause = useActionCreator(Actions.pause);
  const next = useActionCreator(Actions.next);
  const stop = useActionCreator(Actions.stop);
  return (
    <div className="actions">
      <div id="previous" onClick={previous} title="Previous Track" />
      <div id="play" onClick={play} title="Play" />
      <div id="pause" onClick={pause} title="Pause" />
      <div id="stop" onClick={stop} title="Stop" />
      <div id="next" onClick={next} title="Next Track" />
    </div>
  );
});

export default ActionButtons;
