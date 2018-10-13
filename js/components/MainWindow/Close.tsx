import React from "react";
import { connect } from "react-redux";
import ClickedDiv from "../ClickedDiv";

import { close } from "../../actionCreators";
import { Dispatch } from "../../types";

interface DispatchProps {
  onClick: () => void;
}

const Close = ({ onClick }: DispatchProps) => (
  <ClickedDiv id="close" onClick={onClick} title="Close" />
);

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return { onClick: () => dispatch(close()) };
};

export default connect(
  null,
  mapDispatchToProps
)(Close);
