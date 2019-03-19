import React, { ChangeEvent } from "react";
import { connect } from "react-redux";

import * as Actions from "../actionCreators";
import { Dispatch, AppState } from "../types";
import * as Selectors from "../selectors";

interface Props {
  id?: string;
  balance: number;
  showMarquee(): void;
  hideMarquee(): void;
  setBalance(e: ChangeEvent<HTMLInputElement>): void;
  style?: React.CSSProperties;
  className?: string;
}

const Balance = (props: Props) => (
  <input
    id={props.id}
    className={props.className}
    type="range"
    min="-100"
    max="100"
    step="1"
    value={props.balance}
    style={props.style}
    onChange={props.setBalance}
    onMouseDown={props.showMarquee}
    onMouseUp={props.hideMarquee}
    title="Balance"
  />
);

const mapStateToProps = (state: AppState) => ({
  balance: Selectors.getBalance(state),
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  setBalance: (e: ChangeEvent<HTMLInputElement>) =>
    dispatch(Actions.setBalance(Number((e.target as HTMLInputElement).value))),
  showMarquee: () => dispatch(Actions.setFocus("balance")),
  hideMarquee: () => dispatch(Actions.unsetFocus()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Balance);
