import * as React from "react";

import * as Actions from "../actionCreators";
import * as Selectors from "../selectors";
import { useTypedSelector, useActionCreator } from "../hooks";

interface Props {
  id?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function Balance({ style, className, id }: Props) {
  const balance = useTypedSelector(Selectors.getBalance);
  const setBalance = useActionCreator(Actions.setBalance);
  const setFocus = useActionCreator(Actions.setFocus);
  const unsetFocus = useActionCreator(Actions.unsetFocus);
  return (
    <input
      id={id}
      className={className}
      type="range"
      min="-100"
      max="100"
      step="1"
      value={balance}
      style={{ ...style, touchAction: "none" }}
      onChange={(e) => setBalance(Number(e.target.value))}
      onMouseDown={() => setFocus("balance")}
      onMouseUp={unsetFocus}
      title="Balance"
    />
  );
}
