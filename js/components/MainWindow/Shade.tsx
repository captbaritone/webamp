import React from "react";
import { connect } from "react-redux";
import ClickedDiv from "../ClickedDiv";

import { toggleMainWindowShadeMode } from "../../actionCreators";
import { Dispatch } from "../../types";

interface DispatchProps {
  handleClick(): void;
}

const Shade = (props: DispatchProps) => (
  <ClickedDiv
    id="shade"
    onMouseDown={props.handleClick}
    onDoubleClick={e => e.stopPropagation()}
    title="Toggle Windowshade Mode"
  />
);

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    handleClick: () => dispatch(toggleMainWindowShadeMode()),
  };
};

export default connect(
  null,
  mapDispatchToProps
)(Shade);
