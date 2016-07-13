import React from 'react';
import {connect} from 'react-redux';


class Actions extends React.Component {
  constructor(props) {
    super(props);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.stop = this.stop.bind(this);
  }
  play() {
    this.props.dispatch({type: 'PLAY'});
  }
  pause() {
    this.props.dispatch({type: 'PAUSE'});
  }
  stop() {
    this.props.dispatch({type: 'STOP'});
  }
  render() {
    return <div className='actions'>
        <div id='previous'></div>
        <div id='play' onClick={this.play}></div>
        <div id='pause' onClick={this.pause}></div>
        <div id='stop' onClick={this.stop}></div>
        <div id='next'></div>
    </div>;
  }
}

module.exports = connect(state => state.media)(Actions);
