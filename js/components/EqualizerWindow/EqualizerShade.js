import React from "react";
import { connect } from "react-redux";
import Volume from "../Volume";
import Balance from "../Balance";
import { segment } from "../../utils";

import {
  closeEqualizerWindow,
  toggleEqualizerShadeMode
} from "../../actionCreators";

const EqualizerShade = props => {
  const { volume, balance } = props;

  const classes = ["left", "center", "right"];
  const eqVolumeClassName = segment(0, 100, volume, classes);
  const eqBalanceClassName = segment(-100, 100, balance, classes);
  return (
    <div
      className="draggable"
      onDoubleClick={props.toggleEqualizerShadeMode}
      style={{ width: "100%", height: "100%" }}
    >
      <div id="equalizer-shade" onClick={props.toggleEqualizerShadeMode} />
      <div id="equalizer-close" onClick={props.closeEqualizerWindow} />
      <Volume id="equalizer-volume" className={eqVolumeClassName} />
      <Balance id="equalizer-balance" className={eqBalanceClassName} />
    </div>
  );
};

const mapDispatchToProps = {
  closeEqualizerWindow,
  toggleEqualizerShadeMode
};

const mapStateToProps = state => ({
  volume: state.media.volume,
  balance: state.media.balance
});

export default connect(mapStateToProps, mapDispatchToProps)(EqualizerShade);
