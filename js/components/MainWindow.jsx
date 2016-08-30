import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';

import {WINDOWS} from '../constants';

import ActionButtons from './ActionButtons.jsx';
import Balance from './Balance.jsx';
import Close from './Close.jsx';
import ClutterBar from './ClutterBar.jsx';
import ContextMenu from './ContextMenu.jsx';
import DragTarget from './DragTarget.jsx';
import DraggableWindow from './DraggableWindow.jsx';
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

import '../../css/main-window.css';

class MainWindow extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.dispatch({type: 'SET_FOCUSED_WINDOW', window: WINDOWS.MAIN});
  }

  render() {
    const {status} = this.props.media;
    const {loading, doubled, shade, closed, llama} = this.props.display;

    const className = classnames({
      window: true,
      // TODO: Handle these status changes in the individual components
      play: status === 'PLAYING',
      stop: status === 'STOPPED',
      pause: status === 'PAUSED',
      selected: this.props.windows.focused === WINDOWS.MAIN,
      loading,
      doubled,
      llama,
      shade,
      closed
    });

    // TODO: Move this to an actionCreator
    const handleDrop = (files) => {
      this.props.winamp.loadFromFileReference(files[0]);
    };

    // NOTE: DragTarget but be outside Draggable Window, since currently
    // DragTarget creates a wrapper DOM element which, since main-window is
    // absolutely positioned, exists at a different location than the main
    // window. Drag/Drop still work, because events propogate up to parent
    // elements.
    return <DragTarget handleFiles={handleDrop}>
      <DraggableWindow handleClass='title-bar'>
        <div id='main-window' className={className} onClick={this.handleClick}>
          <div id='loading'>Loading...</div>
          <div id='title-bar' className='selected title-bar'>
            <ContextMenu mediaPlayer={this.props.mediaPlayer} winamp={this.props.winamp} />
            <ShadeTime />
            <div id='minimize' />
            <Shade />
            <Close mediaPlayer={this.props.mediaPlayer} />
          </div>
          <div className='status'>
            <ClutterBar />
            <div id='play-pause' />
            <div id='work-indicator' className={this.props.display.working ? 'selected' : ''} />
            <Time />
            <Visualizer analyser={this.props.mediaPlayer._analyser}/>
          </div>
          <div className='media-info'>
            <Marquee />
            <Kbps />
            <Khz />
            <MonoStereo />
          </div>
          <Volume mediaPlayer={this.props.mediaPlayer} />
          <Balance mediaPlayer={this.props.mediaPlayer} />
          <div className='windows'>
            <div id='equalizer-button' />
            <div id='playlist-button' />
          </div>
          <Position mediaPlayer={this.props.mediaPlayer} />
          <ActionButtons mediaPlayer={this.props.mediaPlayer} />
          <Eject winamp={this.props.winamp} />
          <div className='shuffle-repeat'>
            <Shuffle mediaPlayer={this.props.mediaPlayer} />
            <Repeat mediaPlayer={this.props.mediaPlayer} />
          </div>
          <a id='about' target='blank' href='https://github.com/captbaritone/winamp2-js' />
        </div>
      </DraggableWindow>
    </DragTarget>;
  }
}

  module.exports = connect((state) => state)(MainWindow);
