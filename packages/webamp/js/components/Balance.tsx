import * as React from "react";
import { useRef } from "react";

import * as Actions from "../actionCreators";
import { snapBalance } from "../actionCreators/media";
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
  const ref = useRef<HTMLInputElement>(null);

  const handleInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const snapped = snapBalance(Number(input.value));
    // Force DOM value to match snapped value so the slider visually snaps
    if (String(snapped) !== input.value) {
      input.value = String(snapped);
    }
    setBalance(snapped);
  };

  return (
    <input
      ref={ref}
      id={id}
      className={className}
      type="range"
      min="-100"
      max="100"
      step="1"
      value={balance}
      style={{ ...style, touchAction: "none" }}
      onInput={handleInput}
      onPointerDown={() => setFocus("balance")}
      onPointerUp={unsetFocus}
      title="Balance"
    />
  );
}
