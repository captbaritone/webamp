import { memo } from "react";
import * as Actions from "../../actionCreators";
import { useActionCreator } from "../../hooks";
import WinampButton from "../WinampButton";

const ActionButtons = memo(() => {
  const previous = useActionCreator(Actions.previous);
  const play = useActionCreator(Actions.play);
  const pause = useActionCreator(Actions.pause);
  const next = useActionCreator(Actions.next);
  const stop = useActionCreator(Actions.stop);
  return (
    <div className="actions">
      <WinampButton
        id="previous"
        onClick={previous}
        title="Previous Track"
        requireClicksOriginateLocally={false}
      />
      <WinampButton
        id="play"
        onClick={play}
        title="Play"
        requireClicksOriginateLocally={false}
      />
      <WinampButton
        id="pause"
        onClick={pause}
        title="Pause"
        requireClicksOriginateLocally={false}
      />
      <WinampButton
        id="stop"
        onClick={stop}
        title="Stop"
        requireClicksOriginateLocally={false}
      />
      <WinampButton
        id="next"
        onClick={next}
        title="Next Track"
        requireClicksOriginateLocally={false}
      />
    </div>
  );
});

export default ActionButtons;
