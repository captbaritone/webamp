import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';


const MonoStereo = (props) => {
  return <div className='mono-stereo'>
    <div id='stereo' className={classnames({selected: props.channels === 2})} />
    <div id='mono' className={classnames({selected: props.channels === 1})} />
  </div>;
};

module.exports = connect((state) => state.media)(MonoStereo);
