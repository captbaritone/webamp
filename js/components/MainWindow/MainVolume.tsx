import React from "react";
import { connect } from "react-redux";
import * as Selectors from "../../selectors";

import Volume from "../Volume";
import { AppState } from "../../types";

interface Props {
  volume: number;
}

const MainVolume = (props: Props) => {
  const { volume } = props;
  const percent = volume / 100;
  const sprite = Math.round(percent * 28);
  const offset = (sprite - 1) * 15;

  const style = {
    backgroundPosition: `0 -${offset}px`,
  };
  return (
    <div id="volume" style={style}>
      <Volume />
    </div>
  );
};

const mapStateToProps = (state: AppState): Props => ({
  volume: Selectors.getVolume(state),
});

export default connect(mapStateToProps)(MainVolume);
