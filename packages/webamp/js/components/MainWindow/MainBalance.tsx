import React from "react";

import Balance from "../Balance";
import * as Selectors from "../../selectors";
import { useSprite, useTypedSelector } from "../../hooks";

export const offsetFromBalance = (balance: number): number => {
  const percent = Math.abs(balance) / 100;
  const sprite = Math.floor(percent * 27);
  const offset = sprite * 15;
  return offset;
};

const MainBalance = React.memo(() => {
  const balance = useTypedSelector(Selectors.getBalance);
  const spriteStyle = useSprite({
    base: "MAIN_BALANCE_BACKGROUND",
    thumb: "MAIN_BALANCE_THUMB",
    activeThumb: "MAIN_BALANCE_THUMB_ACTIVE",
  });
  return (
    <Balance
      id="balance"
      style={{
        ...spriteStyle,
        left: 177,
        top: 57,
        height: 13,
        width: 38,
        position: "absolute",
        backgroundPosition: `0 -${offsetFromBalance(balance)}px`,
      }}
    />
  );
});

export default MainBalance;
