import { memo } from "react";

import Balance from "../Balance";
import * as Selectors from "../../selectors";
import { useTypedSelector } from "../../hooks";

export const offsetFromBalance = (balance: number): number => {
  const percent = Math.abs(balance) / 100;
  const sprite = Math.floor(percent * 27);
  const offset = sprite * 15;
  return offset;
};

const MainBalance = memo(() => {
  const balance = useTypedSelector(Selectors.getBalance);
  return (
    <Balance
      id="balance"
      style={{ backgroundPosition: `0 -${offsetFromBalance(balance)}px` }}
    />
  );
});

export default MainBalance;
