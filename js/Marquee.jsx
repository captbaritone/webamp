// Single line text display that can animate and hold multiple registers
import React from 'react';
import {connect} from 'react-redux';

import {
  getBalanceText,
  getVolumeText,
  getMediaText,
  getPositionText,
  getDoubleSizeModeText,
  wrapForMarquee
} from './utils';

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
    return <CharacterString onMouseDown={this.handleMouseDown}>
      {text}
    </CharacterString>;
  }
}

module.exports = connect(state => state)(Marquee);
