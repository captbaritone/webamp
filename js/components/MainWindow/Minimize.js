import React from "react";
import { connect } from "react-redux";
import ClickedDiv from "../ClickedDiv";
import { MINIMIZE_WINAMP } from "../../actionTypes";

const Minimize = ({ minimize }) => (
  <ClickedDiv id="minimize" title="Minimize" onClick={minimize} />
);

const mapDispatchToProps = {
  minimize: () => ({ type: MINIMIZE_WINAMP })
};

export default connect(
  null,
  mapDispatchToProps
)(Minimize);
