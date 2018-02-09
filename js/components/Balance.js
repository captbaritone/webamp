import React from "react";
import { connect } from "react-redux";

import { setBalance } from "../actionCreators";
import { SET_FOCUS, UNSET_FOCUS } from "../actionTypes";

const Balance = props => (
  <input
    id={props.id}
    className={props.className}
    type="range"
    min="-100"
    max="100"
    step="1"
    value={props.balance}
    style={props.style}
    onChange={props.handleChange}
    onMouseDown={props.showMarquee}
    onMouseUp={props.hideMarquee}
    title="Balance"
  />
);

const mapDispatchToProps = dispatch => ({
  handleChange: e => dispatch(setBalance(e.target.value)),
  showMarquee: () => dispatch({ type: SET_FOCUS, input: "balance" }),
  hideMarquee: () => dispatch({ type: UNSET_FOCUS })
});

export default connect(
  state => ({ balance: state.media.balance }),
  mapDispatchToProps
)(Balance);
