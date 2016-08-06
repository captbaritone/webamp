import React from 'react';
import {connect} from 'react-redux';

import DraggableWindow from './DraggableWindow.jsx';

import '../../css/playlist-window.css';

const PlaylistWindow = () => {
  return <DraggableWindow handleClass='title-bar'>
    <div id='playlist-window' className='window'>
      <div className='playlist-left'>
        <div className='playlist-right'>
          <div className='playlist-top title-bar'>
            <div className='playlist-top-left' />
            <div className='playlist-top-title' />
            <div className='playlist-top-right'>
              <div id='close-playlist' />
              <div id='shade-playlist' />
            </div>
          </div>
          <div className='playlist-bottom'>
            <div className='playlist-bottom-left' />
            <div className='playlist-visualizer' />
            <div className='playlist-bottom-right' />
          </div>
        </div>
      </div>
    </div>
  </DraggableWindow>;
};

module.exports = connect((state) => state)(PlaylistWindow);
