import React from 'react';

import Actions from './Actions.jsx';
import Balance from './Balance.jsx';
import Close from './Close.jsx';
import ContextMenu from './ContextMenu.jsx';
import Eject from './Eject.jsx';
import Kbps from './Kbps.jsx';
import Khz from './Khz.jsx';
import Marquee from './Marquee.jsx';
import MonoStereo from './MonoStereo.jsx';
import Position from './Position.jsx';
import Repeat from './Repeat.jsx';
import ShadeTime from './ShadeTime.jsx';
import Shuffle from './Shuffle.jsx';
import Time from './Time.jsx';
import Volume from './Volume.jsx';

import '../css/main-window.css';

const MainWindow = () => {
  return <div id='main-window' className='loading stop'>
    <div id='loading'>Loading...</div>
    <div id='title-bar' className='selected'>
      <ContextMenu />
      <ShadeTime />
      <div id='minimize'></div>
      <div id='shade'></div>
      <Close />
    </div>
    <div className='status'>
      <div id='clutter-bar'>
        <div id='button-o'></div>
        <div id='button-a'></div>
        <div id='button-i'></div>
        <div id='button-d'></div>
        <div id='button-v'></div>
      </div>
      <div id='play-pause'></div>
      <div id='work-indicator'></div>
      <Time />
      <canvas id='visualizer' width='152' height='32'></canvas>
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
    <Position />
    <Actions />
    <Eject />
    <div className='shuffle-repeat'>
      <Shuffle />
      <Repeat />
    </div>
    <a id='about' target='blank' href= 'https://github.com/captbaritone/winamp2-js'></a>
  </div>;
};

module.exports = MainWindow;
