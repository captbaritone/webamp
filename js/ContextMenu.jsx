import React from 'react';
import {connect} from 'react-redux';

import {close, setSkinFromFilename} from './actionCreators';

import '../css/context-menu.css';

class ContextMenu extends React.Component {
  constructor(props) {
    super(props);
    this.openFileDialog = this.openFileDialog.bind(this);
    this.close = this.close.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.setSkin = this.setSkin.bind(this);
  }

  componantWillMount() {
    // Clicking anywhere outside the context menu will close the window
    document.addEventListener('click', this.closeMenu);
  }

  componantWillUnmount() {
    document.removeEventListener('click', this.closeMenu);
  }

  openFileDialog() {
    this.props.dispatch({type: 'OPEN_FILE_DIALOG'});
  }

  close() {
    this.props.dispatch(close(this.props.mediaPlayer));
  }

  closeMenu() {
    this.props.dispatch({type: 'CLOSE_CONTEXT_MENU'});
  }

  toggleMenu(event) {
    this.props.dispatch({type: 'TOGGLE_CONTEXT_MENU'});
    event.stopPropagation();
  }

  setSkin(e) {
    this.props.dispatch(setSkinFromFilename(e.target.dataset.filename));
  }

  render() {
    var classes = this.props.selected ? 'selected' : '';
    return <div id='option' className={classes} onClick={this.toggleMenu}>
      <ul id='context-menu'>
        <li><a href='https://github.com/captbaritone/winamp2-js' target='_blank'>Winamp2-js...</a></li>
        <li className='hr'><hr /></li>
        <li id='context-play-file' onClick={this.openFileDialog}>Play File...</li>
        <li className='parent'>
          <ul>
            <li id='context-load-skin' onClick={this.openFileDialog}>Load Skin...</li>
            <li className='hr'><hr /></li>
            <li data-filename='base-2.91.wsz' onClick={this.setSkin} >{'<Base Skin>'}</li>
            <li data-filename='MacOSXAqua1-5.wsz' onClick={this.setSkin} >{'Mac OSX v1.5 (Aqua)'}</li>
            <li data-filename='TopazAmp1-2.wsz' onClick={this.setSkin} >{'TopazAmp'}</li>
            <li data-filename='Vizor1-01.wsz' onClick={this.setSkin} >{'Vizor'}</li>
            <li data-filename='XMMS-Turquoise.wsz' onClick={this.setSkin} >{'XMMS Turquoise '}</li>
            <li data-filename='ZaxonRemake1-0.wsz' onClick={this.setSkin} >{'Zaxon Remake'}</li>
          </ul>
          Skins
        </li>
        <li className='hr'><hr /></li>
        <li id='context-exit' onClick={this.close}>Exit</li>
      </ul>
    </div>;
  }
}

module.exports = connect((state) => state.contextMenu)(ContextMenu);
