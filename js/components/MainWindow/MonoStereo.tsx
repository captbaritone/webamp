import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { AppState } from "../../types";
import * as Selectors from "../../selectors";

interface Props {
  channels: number | null;
}

const MonoStereo = (props: Props) => (
  <div className="mono-stereo">
    <div
      id="stereo"
      className={classnames({ selected: props.channels === 2 })}
    />
    <div id="mono" className={classnames({ selected: props.channels === 1 })} />
  </div>
);

const mapStateToProps = (state: AppState): Props => {
  return {
    channels: Selectors.getChannels(state),
  };
};

export default connect(mapStateToProps)(MonoStereo);
