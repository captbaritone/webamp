import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classnames from "classnames";

import { BANDS, WINDOWS } from "../../constants";
import {
  setEqBand,
  setPreamp,
  setEqToMax,
  setEqToMid,
  setEqToMin,
  closeEqualizerWindow,
  toggleEqualizerShadeMode,
  scrollVolume
} from "../../actionCreators";

import { SET_FOCUSED_WINDOW } from "../../actionTypes";

import Band from "./Band";
import EqOn from "./EqOn";
import EqAuto from "./EqAuto";
import EqGraph from "./EqGraph";
import PresetsContextMenu from "./PresetsContextMenu";
import EqualizerShade from "./EqualizerShade";

import "../../../css/equalizer-window.css";

const bandClassName = band => `band-${band}`;

const EqualizerWindow = props => {
  const { doubled, selected, shade } = props;

  const className = classnames({
    selected,
    doubled,
    shade,
    window: true,
    draggable: true
  });
  return (
    <div
      id="equalizer-window"
      className={className}
      onMouseDown={props.focusWindow}
      onWheel={props.scrollVolume}
    >
      {props.shade ? (
        <EqualizerShade />
      ) : (
        <div>
          <div
            className="equalizer-top title-bar draggable"
            onDoubleClick={props.toggleEqualizerShadeMode}
          >
            <div
              id="equalizer-shade"
              onClick={props.toggleEqualizerShadeMode}
            />
            <div id="equalizer-close" onClick={props.closeEqualizerWindow} />
          </div>
          <EqOn />
          <EqAuto />
          <EqGraph />
          <PresetsContextMenu />
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
      )}
    </div>
  );
};

EqualizerWindow.propTypes = {
  doubled: PropTypes.bool.isRequired,
  selected: PropTypes.bool.isRequired,
  shade: PropTypes.bool.isRequired
};

const mapDispatchToProps = dispatch => ({
  focusWindow: () =>
    dispatch({ type: SET_FOCUSED_WINDOW, window: WINDOWS.EQUALIZER }),
  setPreampValue: value => dispatch(setPreamp(value)),
  setEqToMin: () => dispatch(setEqToMin()),
  setEqToMid: () => dispatch(setEqToMid()),
  setEqToMax: () => dispatch(setEqToMax()),
  setHertzValue: hertz => value => dispatch(setEqBand(hertz, value)),
  closeEqualizerWindow: () => dispatch(closeEqualizerWindow()),
  toggleEqualizerShadeMode: () => dispatch(toggleEqualizerShadeMode()),
  scrollVolume: e => dispatch(scrollVolume(e))
});

const mapStateToProps = state => ({
  doubled: state.display.doubled,
  selected: state.windows.focused === WINDOWS.EQUALIZER,
  shade: state.display.equalizerShade
});

export default connect(mapStateToProps, mapDispatchToProps)(EqualizerWindow);
