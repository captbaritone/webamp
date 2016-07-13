// Single line text display that can animate and hold multiple registers
import React from 'react';
import {connect} from 'react-redux';


class Volume extends React.Component {
  constructor(props) {
    super(props);
    this.setVolume = this.setVolume.bind(this);
    this.showMarquee = this.showMarquee.bind(this);
    this.hideMarquee = this.hideMarquee.bind(this);
  }

  setVolume(e) {
    this.props.dispatch({type: 'SET_VOLUME', volume: e.target.value});
  }

  showMarquee() {
    this.props.dispatch({type: 'SHOW_MARQUEE_REGISTER', register: 'volume'});
  }

  hideMarquee() {
    this.props.dispatch({type: 'SHOW_MARQUEE_REGISTER', register: 'songTitle'});
  }

  render() {
    const volume = this.props.volume;
    const percent = volume / 100;
    const sprite = Math.round(percent * 28);
    const offset = (sprite - 1) * 15;

    const style = {
      backgroundPosition: '0 -' + offset + 'px'
    };

    return <input
      id='volume'
      type='range'
      min='0'
      max='100'
      step='1'
      value={volume}
      style={style}
      onInput={this.setVolume}
      onMouseDown={this.showMarquee}
      onMouseUp={this.hideMarquee}
    />;
  }
}

module.exports = connect(state => state.media)(Volume);
