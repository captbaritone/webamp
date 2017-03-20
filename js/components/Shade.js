import React from "react";
import { connect } from "react-redux";

import { TOGGLE_SHADE_MODE } from "../actionTypes";

const Shade = props => <div id="shade" onClick={props.handleClick} />;

const mapDispatchToProps = dispatch => ({
  handleClick: () => dispatch({ type: TOGGLE_SHADE_MODE })
});

export default connect(() => ({}), mapDispatchToProps)(Shade);
