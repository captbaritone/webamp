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

import {
  SET_FOCUSED_WINDOW,
  TOGGLE_PRESETS_CONTEXT_MENU
} from "../actionTypes";

import Band from "./Band";
import EqOn from "./EqOn";
import EqAuto from "./EqAuto";
import EqGraph from "./EqGraph";
import PresetsContextMenu from "./PresetsContextMenu";

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
      <div id="presets" onClick={props.togglePresetsContextMenu}>
        <PresetsContextMenu
          selected={props.contextMenuSelected}
          fileInput={props.fileInput}
        />
      </div>
      <Band id="preamp" band="preamp" onChange={props.setPreampValue} />
      <div id="plus12db" onClick={props.setEqToMax} />
      <div id="zerodb" onClick={props.setEqToMid} />
      <div id="minus12db" onClick={props.setEqToMin} />
      {BANDS.map(hertz =>
        <Band
          key={hertz}
          id={bandClassName(hertz)}
          band={hertz}
          onChange={props.setHertzValue(hertz)}
        />
      )}
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
  setHertzValue: hertz => value => dispatch(setEqBand(hertz, value)),
  togglePresetsContextMenu: e => {
    dispatch({ type: TOGGLE_PRESETS_CONTEXT_MENU });
    // TODO: Consider binding to a ref instead.
    // https://stackoverflow.com/a/24421834
    e.nativeEvent.stopImmediatePropagation();
  }
});

const mapStateToProps = state => ({
  doubled: state.display.doubled,
  selected: state.windows.focused === WINDOWS.EQUALIZER,
  closed: !state.windows.equalizer,
  contextMenuSelected: state.presetsContextMenu.selected
});

export default connect(mapStateToProps, mapDispatchToProps)(EqualizerWindow);
