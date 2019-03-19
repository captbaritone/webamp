import React from "react";
import { connect } from "react-redux";
import Volume from "../Volume";
import Balance from "../Balance";
import { segment } from "../../utils";

import { closeWindow, toggleEqualizerShadeMode } from "../../actionCreators";
import { AppState, Dispatch } from "../../types";

interface StateProps {
  volume: number;
  balance: number;
}

interface DispatchProps {
  closeWindow(): void;
  toggleEqualizerShadeMode(): void;
}

const EqualizerShade = (props: StateProps & DispatchProps) => {
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
      <div id="equalizer-close" onClick={props.closeWindow} />
      <Volume id="equalizer-volume" className={eqVolumeClassName} />
      <Balance id="equalizer-balance" className={eqBalanceClassName} />
    </div>
  );
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    closeWindow: () => dispatch(closeWindow("equalizer")),
    toggleEqualizerShadeMode: () => dispatch(toggleEqualizerShadeMode()),
  };
};

const mapStateToProps = (state: AppState): StateProps => ({
  volume: state.media.volume,
  balance: state.media.balance,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EqualizerShade);
