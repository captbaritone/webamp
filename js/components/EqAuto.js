import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { SET_EQ_AUTO } from "../actionTypes";

const EqAuto = props => {
  const className = classnames({
    selected: props.auto
  });
  return <div id="auto" className={className} onClick={props.toggleAuto} />;
};

const toggleAuto = () => (dispatch, getState) => {
  dispatch({ type: SET_EQ_AUTO, value: !getState().equalizer.auto });
};

const mapDispatchToProps = { toggleAuto };
export default connect(state => state.equalizer, mapDispatchToProps)(EqAuto);
