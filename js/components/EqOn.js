import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { SET_EQ_ON } from "../actionTypes";

const EqOn = props => {
  const className = classnames({
    selected: props.on
  });
  return <div id="on" className={className} onClick={props.toggleOn} />;
};

const toggleOn = () => (dispatch, getState) => {
  dispatch({ type: SET_EQ_ON, value: !getState().equalizer.on });
};

const mapDispatchToProps = { toggleOn };
export default connect(state => state.equalizer, mapDispatchToProps)(EqOn);
