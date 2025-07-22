import { memo } from "react";
import classnames from "classnames";

import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import { useActionCreator, useTypedSelector } from "../../hooks";
import WinampButton from "../WinampButton";

function toggleEqualizer() {
  return Actions.toggleWindow("equalizer");
}

const EqToggleButton = memo(() => {
  const handleClick = useActionCreator(toggleEqualizer);
  const windowOpen = useTypedSelector(Selectors.getWindowOpen)("equalizer");
  return (
    <WinampButton
      id="equalizer-button"
      className={classnames({ selected: windowOpen })}
      onClick={handleClick}
      title="Toggle Graphical Equalizer"
      requireClicksOriginateLocally={false}
    />
  );
});

export default EqToggleButton;
