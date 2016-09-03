import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';

import {BANDS, WINDOWS} from '../constants';
import {setEqBand, setPreamp} from '../actionCreators';

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
    this.setPreampValue = this.setPreampValue.bind(this);
  }

  setHertzValue(hertz) {
    return (e) => {
      this.props.dispatch(
        setEqBand(this.props.mediaPlayer, hertz, e.target.value)
      );
    };
  }

  setPreampValue(e) {
    this.props.dispatch(
      setPreamp(this.props.mediaPlayer, e.target.value)
    );
  }

  render() {
    const {doubled} = this.props.display;

    const className = classnames({
      window: true,
      selected: this.props.windows.focused === WINDOWS.EQUALIZER,
      closed: !this.props.windows.equalizer,
      doubled
    });
    return <DraggableWindow handleClass='title-bar'>
      <div id='equalizer-window' className={className} onClick={this.props.focusWindow}>
        <div className='equalizer-top title-bar' />
        <EqOn />
        <EqAuto />
        <EqGraph />
        <div id='presets' />
        <Band id='preamp' band='preamp' onChange={this.setPreampValue} />
        <div id='plus12db' onClick={this.props.setEqToMax} />
        <div id='zerodb' onClick={this.props.setEqToMid} />
        <div id='minus12db' onClick={this.props.setEqToMin} />
        {BANDS.map((hertz) => (
          <Band
            key={hertz}
            id={bandClassName(hertz)}
            band={hertz}
            onChange={this.setHertzValue(hertz)}
          />
        ))}
      </div>
    </DraggableWindow>;
  }
}

const mapDispatchToProps = (dispatch) => ({
  setEqToMax: () => dispatch({type: 'SET_EQ_TO_MAX'}),
  setEqToMid: () => dispatch({type: 'SET_EQ_TO_MID'}),
  setEqToMin: () => dispatch({type: 'SET_EQ_TO_MIN'}),
  focusWindow: () => dispatch({type: 'SET_FOCUSED_WINDOW', window: WINDOWS.EQUALIZER})
});

module.exports = connect((state) => state, mapDispatchToProps)(EqualizerWindow);
