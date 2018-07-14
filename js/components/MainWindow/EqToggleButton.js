import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { getWindowOpen } from "../../selectors";
import { toggleWindow } from "../../actionCreators";

const EqToggleButton = props => (
  <div
    id="equalizer-button"
    className={classnames({ selected: props.getWindowOpen("equalizer") })}
    onClick={props.handleClick}
    title="Toggle Graphical Equalizer"
  />
);

const mapStateToProps = state => ({
  getWindowOpen: getWindowOpen(state)
});

const mapDispatchToProps = {
  handleClick: () => toggleWindow("equalizer")
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EqToggleButton);
