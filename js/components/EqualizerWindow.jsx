import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';

import DraggableWindow from './DraggableWindow.jsx';

import '../../css/equalizer-window.css';

const EqualizerWindow = (props) => {
  const {doubled} = props.display;

  const className = classnames({
    window: true,
    doubled
  });
  return <DraggableWindow handleClass='title-bar'>
    <div id='equalizer-window' className={className}>
      <div className='equalizer-top title-bar' />
    </div>
  </DraggableWindow>;
};

module.exports = connect((state) => state)(EqualizerWindow);
