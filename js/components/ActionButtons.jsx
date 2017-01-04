import React from 'react';
import {connect} from 'react-redux';
import {play, pause, stop} from '../actionCreators';


const ActionButtons = (props) => (
  <div className='actions'>
    <div id='previous' />
    <div id='play' onClick={props.play} />
    <div id='pause' onClick={props.pause} />
    <div id='stop' onClick={props.stop} />
    <div id='next' />
  </div>
);

const mapStateToProps = (state) => state.media;

const mapDispatchToProps = (dispatch) => ({
  play: () => dispatch(play()),
  pause: () => dispatch(pause()),
  stop: () => dispatch(stop())
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(ActionButtons);
