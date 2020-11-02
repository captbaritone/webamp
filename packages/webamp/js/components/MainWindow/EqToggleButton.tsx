import { memo } from "react";
import classnames from "classnames";

import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import { useActionCreator, useTypedSelector } from "../../hooks";

function toggleEqualizer() {
  return Actions.toggleWindow("equalizer");
}

const EqToggleButton = memo(() => {
  const handleClick = useActionCreator(toggleEqualizer);
  const windowOpen = useTypedSelector(Selectors.getWindowOpen)("equalizer");
  return (
    <div
      id="equalizer-button"
      className={classnames({ selected: windowOpen })}
      onClick={handleClick}
      title="Toggle Graphical Equalizer"
    />
  );
});

export default EqToggleButton;
