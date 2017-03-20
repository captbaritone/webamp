import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { toggleRepeat } from "../actionCreators";

const Repeat = props => (
  <div
    id="repeat"
    className={classnames({ selected: props.repeat })}
    onClick={props.handleClick}
  />
);

const mapStateToProps = state => ({
  repeat: state.media.repeat
});

const mapDispatchToProps = dispatch => ({
  handleClick: () => dispatch(toggleRepeat())
});

export default connect(mapStateToProps, mapDispatchToProps)(Repeat);
