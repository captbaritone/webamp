import React from 'react';
import {connect} from 'react-redux';
import {setVolume} from '../actionCreators';


const Volume = (props) => {
  const {volume} = props;
  const percent = volume / 100;
  const sprite = Math.round(percent * 28);
  const offset = (sprite - 1) * 15;

  const style = {
    backgroundPosition: `0 -${offset}px`
  };

  return <input
    id='volume'
    type='range'
    min='0'
    max='100'
    step='1'
    value={volume}
    style={style}
    onChange={props.setVolume}
    onMouseDown={props.showMarquee}
    onMouseUp={props.hideMarquee}
  />;
};

const mapStateToProps = (state) => state.media;

const mapDispatchToProps = (dispatch, ownProps) => ({
  showMarquee: () => dispatch({type: 'SET_FOCUS', input: 'volume'}),
  hideMarquee: () => dispatch({type: 'UNSET_FOCUS'}),
  setVolume: (e) => dispatch(setVolume(ownProps.mediaPlayer, e.target.value))
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Volume);
