import React from "react";
import { connect } from "react-redux";
import ClickedDiv from "../ClickedDiv";

import { close } from "../../actionCreators";

const Close = ({ onClick }) => (
  <ClickedDiv id="close" onClick={onClick} title="Close" />
);

export default connect(null, { onClick: close })(Close);
