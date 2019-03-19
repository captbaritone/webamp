import React from "react";
import { connect } from "react-redux";
import ClickedDiv from "../ClickedDiv";
import * as Actions from "../../actionCreators";
import { Dispatch } from "../../types";

interface Props {
  minimize(): void;
}

const Minimize = ({ minimize }: Props) => (
  <ClickedDiv id="minimize" title="Minimize" onClick={minimize} />
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  minimize: () => dispatch(Actions.minimize()),
});

export default connect(
  null,
  mapDispatchToProps
)(Minimize);
