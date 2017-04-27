import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { toggleEq } from "../actionCreators";

const EqOn = props => {
  const className = classnames({
    selected: props.on
  });
  return <div id="on" className={className} onClick={props.toggleEq} />;
};

export default connect(state => state.equalizer, { toggleEq })(EqOn);
