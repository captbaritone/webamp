// Single line text display that can animate and hold multiple registers
import React from 'react';
import {connect} from 'react-redux';

import {getTimeStr} from './utils';

const getBalanceText = (balance) => {
  if (balance === 0) {
    return 'Balance: Center';
  }
  const direction = balance > 0 ? 'Right' : 'Left';
  return `Balance: ${Math.abs(balance)}% ${direction}`;
};

const getVolumeText = (volume) => `Volume: ${volume}%`;

const getPositionText = (duration, seekToPercent) => {
  const newElapsedStr = getTimeStr(duration * seekToPercent / 100);
  const durationStr = getTimeStr(duration);
  return `Seek to: ${newElapsedStr}/${durationStr} (${seekToPercent}%)`;
};

const getMediaText = (name, duration) => {
  return `${name} (${getTimeStr(duration)})  ***  `;
};

const getDoubleSizeModeText = (enabled) => {
  return `${enabled ? 'Disable' : 'Enable'} doublesize mode`;
};

const wrapForMarquee = (text, step) => {
  if (text.length <= 30) {
    return text;
  }
  step = step % (text.length + 1);
  const chars = text.split('');
  const start = chars.slice(step);
  const end = chars.slice(0, step);
  return [...start, ' ', ...end].slice(0, 30).join('');
};

import CharacterString from './CharacterString.jsx';

class Marquee extends React.Component {
  constructor(props) {
    super(props);
    this.state = {stepping: true};
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.getText = this.getText.bind(this);
  }

  componentDidMount() {
    const step = () => {
      setTimeout(() => {
        if (this.state.stepping) {
          this.props.dispatch({type: 'STEP_MARQUEE'});
        }
        step();
      }, 220);
    };
    step();
  }

  getText() {
    switch (this.props.userInput.focus) {
      case 'balance':
        return getBalanceText(this.props.media.balance);
      case 'volume':
        return getVolumeText(this.props.media.volume);
      case 'position':
        return getPositionText(this.props.media.length, this.props.userInput.scrubPosition);
      case 'double':
        return getDoubleSizeModeText(this.props.display.doubled);
      default:
        break;
    }
    if (this.props.media.name) {
      return getMediaText(this.props.media.name, this.props.media.length);
    }
    return 'Winamp 2.91';
  }

  handleMouseDown() {
    this.setState({stepping: false});
    document.addEventListener('mouseup', () => {
      // TODO: Remove this listener
      setTimeout(() => {
        this.setState({stepping: true});
      }, 1000);
    });
  }

  render() {
    const text = wrapForMarquee(this.getText(), this.props.display.marqueeStep);
    return <CharacterString id='marquee' className='text' onMouseDown={this.handleMouseDown}>
      {text}
    </CharacterString>;
  }
}

export {
  getBalanceText,
  getVolumeText,
  getPositionText,
  getMediaText,
  getDoubleSizeModeText,
  wrapForMarquee,
  Marquee
};
export default connect(state => state)(Marquee);
