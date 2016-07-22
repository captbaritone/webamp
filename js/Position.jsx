// Single line text display that can animate and hold multiple registers
import React from 'react';
import {connect} from 'react-redux';

import {getTimeStr} from './utils';

class Position extends React.Component {
  constructor(props) {
    super(props);
    // Consider moving to global state. Currently nobody else cares.
    this.state = {
      mouseIsDown: false,
      currentPosition: 0
    };
    this.setPosition = this.setPosition.bind(this);
    this.showMarquee = this.showMarquee.bind(this);
    this.hideMarquee = this.hideMarquee.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  setPosition(e) {
    this.props.dispatch({type: 'SHOW_MARQUEE_REGISTER', register: 'message'});
    this.setState({
      mouseIsDown: true,
      currentPosition: e.target.value
    });
    var newPercentComplete = e.target.value;
    var newElapsed = getTimeStr(this.props.length * newPercentComplete / 100);
    var duration = getTimeStr(this.props.length);
    var message = `Seek to: ${newElapsed}/${duration} (${newPercentComplete}%)`;
    this.props.dispatch({type: 'SET_MARQUEE_REGISTER', register: 'message', text: message});
  }

  onMouseUp(e) {
    this.props.dispatch({type: 'SHOW_MARQUEE_REGISTER', register: 'songTitle'});
    this.props.dispatch({type: 'SET_POSITION', position: e.target.value});
    this.setState({mouseIsDown: false});
  }

  showMarquee() {
  }

  hideMarquee() {
  }

  render() {
    const position = this.props.length ?
      (this.props.timeElapsed / this.props.length) * 100 :
      0;

    // In shade mode, the position slider shows up differently depending on if
    // it's near the start, middle or end of its progress
    let className = '';
    if (position <= 33) {
      className = 'left';
    } else if (position >= 66) {
      className = 'right';
    }

    const displayedPosition = this.state.mouseIsDown ? this.state.currentPosition : position;
    return <input
      id='position'
      className={className}
      type='range'
      min='0'
      max='100'
      step='1'
      value={displayedPosition}
      onChange={this.change}
      onInput={this.setPosition}
      onMouseUp={this.onMouseUp}
      onMouseDown={this.setPosition}
    />;
  }
}

module.exports = connect(state => state.media)(Position);
