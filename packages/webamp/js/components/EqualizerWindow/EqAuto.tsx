import { memo } from "react";
import classnames from "classnames";

import * as Actions from "../../actionCreators";
import { useTypedSelector, useActionCreator } from "../../hooks";

const EqAuto = memo(() => {
  const selected = useTypedSelector((state) => state.equalizer.auto);
  const toggleAuto = useActionCreator(Actions.toggleEqAuto);
  return (
    <div id="auto" className={classnames({ selected })} onClick={toggleAuto} />
  );
});

export default EqAuto;
