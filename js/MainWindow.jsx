import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';

import Actions from './Actions.jsx';
import Balance from './Balance.jsx';
import Close from './Close.jsx';
import ClutterBar from './ClutterBar.jsx';
import ContextMenu from './ContextMenu.jsx';
import DragTarget from './DragTarget.jsx';
import Eject from './Eject.jsx';
import Kbps from './Kbps.jsx';
import Khz from './Khz.jsx';
import Marquee from './Marquee.jsx';
import MonoStereo from './MonoStereo.jsx';
import Position from './Position.jsx';
import Repeat from './Repeat.jsx';
import Shade from './Shade.jsx';
import ShadeTime from './ShadeTime.jsx';
import Shuffle from './Shuffle.jsx';
import Time from './Time.jsx';
import Visualizer from './Visualizer.jsx';
import Volume from './Volume.jsx';

import '../css/main-window.css';

const MainWindow = (props) => {
  const {status} = props.media;
  const {loading, doubled, shade, closed, llama} = props.display;

  const className = classnames({
    // TODO: Handle these status changes in the individual components
    play: status === 'PLAYING',
    stop: status === 'STOPPED',
    pause: status === 'PAUSED',
    loading,
    doubled,
    llama,
    shade,
    closed
  });

  // TODO: Move this to an actionCreator
  const handleDrop = (files) => {
    props.winamp.loadFromFileReference(files[0]);
  };

  return <DragTarget handleFiles={handleDrop}>
    <div id='main-window' className={className}>
      <div id='loading'>Loading...</div>
      <div id='title-bar' className='selected'>
        <ContextMenu mediaPlayer={props.mediaPlayer} winamp={props.winamp} />
        <ShadeTime />
        <div id='minimize'></div>
        <Shade />
        <Close />
      </div>
      <div className='status'>
        <ClutterBar />
        <div id='play-pause'></div>
        <div id='work-indicator' className={props.display.working ? 'selected' : ''}></div>
        <Time />
        <Visualizer />
      </div>
      <div className='media-info'>
        <Marquee />
        <Kbps />
        <Khz />
        <MonoStereo />
      </div>
      <Volume />
      <Balance />
      <div className='windows'>
        <div id='equalizer-button'></div>
        <div id='playlist-button'></div>
      </div>
      <Position mediaPlayer={props.mediaPlayer} />
      <Actions mediaPlayer={props.mediaPlayer} />
      <Eject />
      <div className='shuffle-repeat'>
        <Shuffle />
        <Repeat />
      </div>
      <a id='about' target='blank' href='https://github.com/captbaritone/winamp2-js'></a>
    </div>
  </DragTarget>;
};

module.exports = connect((state) => state)(MainWindow);
