import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

const MonoStereo = props => (
  <div className="mono-stereo">
    <div
      id="stereo"
      className={classnames({ selected: props.channels === 2 })}
    />
    <div id="mono" className={classnames({ selected: props.channels === 1 })} />
  </div>
);

export default connect(state => state.media)(MonoStereo);
