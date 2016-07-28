// Single line text display that can animate and hold multiple registers
import React from 'react';
import {connect} from 'react-redux';

class Position extends React.Component {
  constructor(props) {
    super(props);
    this.setPosition = this.setPosition.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  setPosition(e) {
    this.props.dispatch({type: 'SET_FOCUS', input: 'position'});
    this.props.dispatch({type: 'SET_SCRUB_POSITION', position: e.target.value});
  }

  onMouseUp(e) {
    this.props.mediaPlayer.seekToPercentComplete(e.target.value);
    this.props.dispatch({type: 'UNSET_FOCUS'});
  }

  render() {
    const position = this.props.media.length ?
      (this.props.media.timeElapsed / this.props.media.length) * 100 :
      0;

    // In shade mode, the position slider shows up differently depending on if
    // it's near the start, middle or end of its progress
    let className = '';
    if (position <= 33) {
      className = 'left';
    } else if (position >= 66) {
      className = 'right';
    }

    const displayedPosition = this.props.userInput.focus === 'position' ?
      this.props.userInput.scrubbingPosition :
      position;

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

module.exports = connect(state => state)(Position);
