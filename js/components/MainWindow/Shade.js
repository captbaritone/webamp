import React from "react";
import { connect } from "react-redux";

import { toggleMainWindowShadeMode } from "../../actionCreators";

const Shade = props => (
  <div id="shade" onClick={props.handleClick} title="Toggle Windowshade Mode" />
);

const mapDispatchToProps = {
  handleClick: toggleMainWindowShadeMode
};

export default connect(() => ({}), mapDispatchToProps)(Shade);
