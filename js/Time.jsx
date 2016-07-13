import React from 'react';
import {connect} from 'react-redux';

import {getTimeObj} from './utils';

class Time extends React.Component {
  constructor(props) {
    super(props);
    this.toggleTimeMode = this.toggleTimeMode.bind(this);
  }
  toggleTimeMode() {
    this.props.dispatch({type: 'TOGGLE_TIME_MODE'});
  }
  render() {
    const seconds = this.props.timeMode === 'ELAPSED' ?
      this.props.timeElapsed :
      this.props.length - this.props.timeElapsed;

    const timeObj = getTimeObj(seconds);
    return <div id='time' onClick={this.toggleTimeMode} className='countdown'>
      {this.props.timeMode === 'REMAINING' && <div id='minus-sign'></div>}
      <div id='minute-first-digit' className={'digit digit-' + timeObj.minutesFirstDigit}></div>
      <div id='minute-second-digit' className={'digit digit-' + timeObj.minutesSecondDigit}></div>
      <div id='second-first-digit' className={'digit digit-' + timeObj.secondsFirstDigit}></div>
      <div id='second-second-digit' className={'digit digit-' + timeObj.secondsSecondDigit}></div>
    </div>;
  }
}

module.exports = connect(state => state.media)(Time);
