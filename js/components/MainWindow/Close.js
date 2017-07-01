import React from "react";
import { connect } from "react-redux";

import { close } from "../../actionCreators";

const Close = ({ onClick }) => <div id="close" onClick={onClick} />;

export default connect(null, { onClick: close })(Close);
