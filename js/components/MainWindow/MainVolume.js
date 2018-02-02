import React from "react";
import { connect } from "react-redux";

import Volume from "../Volume";

const MainVolume = props => {
  const { volume } = props;
  const percent = volume / 100;
  const sprite = Math.round(percent * 28);
  const offset = (sprite - 1) * 15;

  const style = {
    backgroundPosition: `0 -${offset}px`
  };
  return (
    <div id="volume" style={style}>
      <Volume />
    </div>
  );
};

const mapStateToProps = state => ({
  volume: state.media.volume
});

export default connect(mapStateToProps)(MainVolume);
