import React from "react";
import { connect } from "react-redux";

import { setBalance } from "../actionCreators";
import { SET_FOCUS, UNSET_FOCUS } from "../actionTypes";

const offsetFromBalance = balance => {
  const percent = Math.abs(balance) / 100;
  const sprite = Math.round(percent * 28);
  const offset = (sprite - 1) * 15;
  return offset;
};

const Balance = ({ balance, handleChange, showMarquee, hideMarquee }) => (
  <input
    id="balance"
    type="range"
    min="-100"
    max="100"
    step="1"
    value={balance}
    style={{ backgroundPosition: `0 -${offsetFromBalance(balance)}px` }}
    onChange={handleChange}
    onMouseDown={showMarquee}
    onMouseUp={hideMarquee}
  />
);

const mapStateToProps = state => state.media;

const mapDispatchToProps = dispatch => ({
  handleChange: e => dispatch(setBalance(e.target.value)),
  showMarquee: () => dispatch({ type: SET_FOCUS, input: "balance" }),
  hideMarquee: () => dispatch({ type: UNSET_FOCUS })
});

export default connect(mapStateToProps, mapDispatchToProps)(Balance);
