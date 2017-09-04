import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { toggleEq } from "../../actionCreators";

const EqOn = props => {
  const className = classnames({
    selected: props.on
  });
  return <div id="on" className={className} onClick={props.toggleEq} />;
};

const mapStateToProps = state => ({ on: state.equalizer.on });

export default connect(mapStateToProps, { toggleEq })(EqOn);
