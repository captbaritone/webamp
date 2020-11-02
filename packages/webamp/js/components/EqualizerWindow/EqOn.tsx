import classnames from "classnames";

import * as Actions from "../../actionCreators";
import * as Selectors from "../../selectors";
import { useActionCreator, useTypedSelector } from "../../hooks";

const EqOn = () => {
  const toggleEq = useActionCreator(Actions.toggleEq);
  const on = useTypedSelector(Selectors.getEqualizerEnabled);
  return (
    <div id="on" className={classnames({ selected: on })} onClick={toggleEq} />
  );
};

export default EqOn;
