import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';

import {BANDS, WINDOWS} from '../constants';
import {
  setEqBand,
  setPreamp,
  setEqToMax,
  setEqToMid,
  setEqToMin
} from '../actionCreators';

import {
  SET_FOCUSED_WINDOW
} from '../actionTypes';

import Band from './Band';
import EqOn from './EqOn';
import EqAuto from './EqAuto';
import EqGraph from './EqGraph';

import '../../css/equalizer-window.css';

const bandClassName = (band) => `band-${band}`;

const EqualizerWindow = (props) => {
  const {doubled} = props.display;

  const className = classnames({
    window: true,
    selected: props.windows.focused === WINDOWS.EQUALIZER,
    closed: !props.windows.equalizer,
    draggable: true,
    doubled
  });
  return (
    <div id='equalizer-window' className={className} onClick={props.focusWindow}>
      <div className='equalizer-top title-bar draggable' />
      <EqOn />
      <EqAuto />
      <EqGraph />
      <div id='presets' />
      <Band
        id='preamp'
        band='preamp'
        onChange={props.setPreampValue}
      />
      <div
        id='plus12db'
        onClick={props.setEqToMax}
      />
      <div
        id='zerodb'
        onClick={props.setEqToMid}
      />
      <div
        id='minus12db'
        onClick={props.setEqToMin}
      />
      {BANDS.map((hertz) => (
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

const mapDispatchToProps = (dispatch) => ({
  focusWindow: () => dispatch({type: SET_FOCUSED_WINDOW, window: WINDOWS.EQUALIZER}),
  setPreampValue: (e) => dispatch(setPreamp(e.target.value)),
  setEqToMin: () => dispatch(setEqToMin()),
  setEqToMid: () => dispatch(setEqToMid()),
  setEqToMax: () => dispatch(setEqToMax()),
  setHertzValue: (hertz) => (e) => dispatch(setEqBand(hertz, e.target.value)),
  dispatch
});

module.exports = connect((state) => state, mapDispatchToProps)(EqualizerWindow);
