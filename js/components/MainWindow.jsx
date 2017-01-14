import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';

import {WINDOWS} from '../constants';

import ActionButtons from './ActionButtons';
import Balance from './Balance';
import Close from './Close';
import ClutterBar from './ClutterBar';
import ContextMenu from './ContextMenu';
//import DragTarget from './DragTarget';
import Eject from './Eject';
import EqToggleButton from './EqToggleButton';
import Kbps from './Kbps';
import Khz from './Khz';
import Marquee from './Marquee';
import MonoStereo from './MonoStereo';
import Position from './Position';
import Repeat from './Repeat';
import Shade from './Shade';
import ShadeTime from './ShadeTime';
import Shuffle from './Shuffle';
import Time from './Time';
import Visualizer from './Visualizer';
import Volume from './Volume';

import {
  SET_FOCUSED_WINDOW
} from '../actionTypes';

import '../../css/main-window.css';

export class MainWindow extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
  }

  handleClick() {
    this.props.dispatch({type: SET_FOCUSED_WINDOW, window: WINDOWS.MAIN});
  }

  supress(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  handleDrop(e) {
    this.supress(e);
    const {files} = e.dataTransfer;
    // TODO: Move this to an actionCreator
    this.props.winamp.loadFromFileReference(files[0]);
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
      draggable: true,
      loading,
      doubled,
      llama,
      shade,
      closed
    });

    return (
      <div
        id='main-window'
        className={className}
        onClick={this.handleClick}
        onMouseDown={this.props.startDrag}
        onDragEnter={this.supress}
        onDragOver={this.supress}
        onDrop={this.handleDrop}
      >
        <div id='loading'>Loading...</div>
        <div id='title-bar' className='selected title-bard draggable'>
          <ContextMenu mediaPlayer={this.props.mediaPlayer} winamp={this.props.winamp} />
          <ShadeTime />
          <div id='minimize' />
          <Shade />
          <Close />
        </div>
        <div className='status'>
          <ClutterBar />
          <div id='play-pause' />
          <div id='work-indicator' className={classnames({selected: this.props.display.working})} />
          <Time />
          <Visualizer analyser={this.props.mediaPlayer._analyser}/>
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
          <EqToggleButton />
          <div id='playlist-button' />
        </div>
        <Position />
        <ActionButtons />
        <Eject winamp={this.props.winamp} />
        <div className='shuffle-repeat'>
          <Shuffle />
          <Repeat />
        </div>
        <a id='about' target='blank' href='https://github.com/captbaritone/winamp2-js' />
      </div>
    );
  }
}

export default connect((state) => state)(MainWindow);
