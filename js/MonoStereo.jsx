import React from 'react';
import {connect} from 'react-redux';


const MonoStereo = (props) => {
  return <div className='mono-stereo'>
    <div id='stereo' className={props.channels === 2 ? 'selected' : ''}></div>
    <div id='mono' className={props.channels === 1 ? 'selected' : ''}></div>
  </div>;
};

module.exports = connect((state) => state.media)(MonoStereo);
