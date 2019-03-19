import React from "react";
import { connect } from "react-redux";

import Balance from "../Balance";
import { AppState } from "../../types";

interface StateProps {
  balance: number;
}

export const offsetFromBalance = (balance: number): number => {
  const percent = Math.abs(balance) / 100;
  const sprite = Math.floor(percent * 27);
  const offset = sprite * 15;
  return offset;
};

const MainBalance = (props: StateProps) => (
  <Balance
    id="balance"
    style={{ backgroundPosition: `0 -${offsetFromBalance(props.balance)}px` }}
  />
);

const mapStateToProps = (state: AppState): StateProps => ({
  balance: state.media.balance,
});

export default connect(mapStateToProps)(MainBalance);
