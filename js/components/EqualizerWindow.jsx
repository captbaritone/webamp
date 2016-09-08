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

import DraggableWindow from './DraggableWindow.jsx';
import Band from './Band.jsx';
import EqOn from './EqOn.jsx';
import EqAuto from './EqAuto.jsx';
import EqGraph from './EqGraph.jsx';

import '../../css/equalizer-window.css';

const bandClassName = (band) => {
  return `band-${band}`;
};

class EqualizerWindow extends React.Component {
  constructor(props) {
    super(props);
    this.setHertzValue = this.setHertzValue.bind(this);
  }

  setHertzValue(hertz) {
    return (e) => {
      this.props.dispatch(
        setEqBand(this.props.mediaPlayer, hertz, e.target.value)
      );
    };
  }

  render() {
    const {doubled} = this.props.display;

    const className = classnames({
      window: true,
      selected: this.props.windows.focused === WINDOWS.EQUALIZER,
      closed: !this.props.windows.equalizer,
      doubled
    });
    return (
      <DraggableWindow handleClass='title-bar'>
        <div id='equalizer-window' className={className} onClick={this.props.focusWindow}>
          <div className='equalizer-top title-bar' />
          <EqOn />
          <EqAuto />
          <EqGraph />
          <div id='presets' />
          <Band
            id='preamp'
            band='preamp'
            onChange={this.props.setPreampValue(this.props.mediaPlayer)}
          />
          <div
            id='plus12db'
            onClick={this.props.setEqToMax(this.props.mediaPlayer)}
          />
          <div
            id='zerodb'
            onClick={this.props.setEqToMid(this.props.mediaPlayer)}
          />
          <div
            id='minus12db'
            onClick={this.props.setEqToMin(this.props.mediaPlayer)}
          />
          {BANDS.map((hertz) => (
            <Band
              key={hertz}
              id={bandClassName(hertz)}
              band={hertz}
              onChange={this.setHertzValue(hertz)}
            />
          ))}
        </div>
      </DraggableWindow>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  focusWindow: () => dispatch({type: 'SET_FOCUSED_WINDOW', window: WINDOWS.EQUALIZER}),
  setPreampValue: (mediaPlayer) => (e) => dispatch(setPreamp(mediaPlayer, e.target.value)),
  setEqToMin: (mediaPlayer) => () => dispatch(setEqToMin(mediaPlayer)),
  setEqToMid: (mediaPlayer) => () => dispatch(setEqToMid(mediaPlayer)),
  setEqToMax: (mediaPlayer) => () => dispatch(setEqToMax(mediaPlayer)),
  dispatch
});

module.exports = connect((state) => state, mapDispatchToProps)(EqualizerWindow);
