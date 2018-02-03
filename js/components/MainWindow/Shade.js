import React from "react";
import { connect } from "react-redux";
import ClickedDiv from "../ClickedDiv";

import { toggleMainWindowShadeMode } from "../../actionCreators";

const Shade = props => (
  <ClickedDiv
    id="shade"
    onMouseDown={props.handleClick}
    title="Toggle Windowshade Mode"
  />
);

const mapDispatchToProps = {
  handleClick: toggleMainWindowShadeMode
};

export default connect(() => ({}), mapDispatchToProps)(Shade);
