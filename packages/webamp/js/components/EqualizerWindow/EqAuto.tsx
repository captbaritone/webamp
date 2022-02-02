import { memo } from "react";
import classnames from "classnames";

import * as Actions from "../../actionCreators";
import { useTypedSelector, useActionCreator } from "../../hooks";
import WinampButton from "../WinampButton";

const EqAuto = memo(() => {
  const selected = useTypedSelector((state) => state.equalizer.auto);
  const toggleAuto = useActionCreator(Actions.toggleEqAuto);
  return (
    <WinampButton
      id="auto"
      className={classnames({ selected })}
      onClick={toggleAuto}
    />
  );
});

export default EqAuto;
