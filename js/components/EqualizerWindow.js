import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { BANDS, WINDOWS } from "../constants";
import {
  setEqBand,
  setPreamp,
  setEqToMax,
  setEqToMid,
  setEqToMin
} from "../actionCreators";

import { SET_FOCUSED_WINDOW } from "../actionTypes";

import Band from "./Band";
import EqOn from "./EqOn";
import EqAuto from "./EqAuto";
import EqGraph from "./EqGraph";

import "../../css/equalizer-window.css";

const bandClassName = band => `band-${band}`;

const EqualizerWindow = props => {
  const { doubled, selected, closed } = props;

  const className = classnames({
    selected,
    closed,
    doubled,
    window: true,
    draggable: true
  });
  return (
    <div
      id="equalizer-window"
      className={className}
      onClick={props.focusWindow}
    >
      <div className="equalizer-top title-bar draggable" />
      <EqOn />
      <EqAuto />
      <EqGraph />
      <div id="presets" />
      <Band id="preamp" band="preamp" onChange={props.setPreampValue} />
      <div id="plus12db" onClick={props.setEqToMax} />
      <div id="zerodb" onClick={props.setEqToMid} />
      <div id="minus12db" onClick={props.setEqToMin} />
      {BANDS.map(hertz => (
        <Band
          key={hertz}
          id={bandClassName(hertz)}
          band={hertz}
          onChange={props.setHertzValue(hertz)}
        />
      ))}
    </div>
  );
};

EqualizerWindow.propTypes = {
  doubled: React.PropTypes.bool.isRequired,
  selected: React.PropTypes.bool.isRequired,
  closed: React.PropTypes.bool.isRequired
};

const mapDispatchToProps = dispatch => ({
  focusWindow: () =>
    dispatch({ type: SET_FOCUSED_WINDOW, window: WINDOWS.EQUALIZER }),
  setPreampValue: value => dispatch(setPreamp(value)),
  setEqToMin: () => dispatch(setEqToMin()),
  setEqToMid: () => dispatch(setEqToMid()),
  setEqToMax: () => dispatch(setEqToMax()),
  setHertzValue: hertz => value => dispatch(setEqBand(hertz, value))
});

const mapStateToProps = state => ({
  doubled: state.display.doubled,
  selected: state.windows.focused === WINDOWS.EQUALIZER,
  closed: !state.windows.equalizer
});

export default connect(mapStateToProps, mapDispatchToProps)(EqualizerWindow);
