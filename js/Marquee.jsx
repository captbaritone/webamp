// Single line text display that can animate and hold multiple registers
import React from 'react';
import {connect} from 'react-redux';

import CharacterString from './CharacterString.jsx';


class Marquee extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseDown = this.handleMouseDown.bind(this);
  }

  componentDidMount() {
    const step = () => {
      setTimeout(() => {
        this.props.dispatch({type: 'STEP_MARQUEE'});
        step();
      }, 220);
    };
    step();
  }
  selectedRegister() {
    const selected = this.props.registers.filter(register => {
      return register.id === this.props.selectedRegister;
    });
    return selected ? selected[0] : selected;
  }
  handleMouseDown() {
    this.props.dispatch({type: 'PAUSE_MARQUEE'});
    document.addEventListener('mouseup', () => {
      // TODO: Remove this listener
      setTimeout(() => {
        this.props.dispatch({type: 'START_MARQUEE'});
      }, 1000);
    });
  }

  render() {
    const register = this.selectedRegister();
    let chars = register.text.split('');
    if (chars.length > 30 && register.step > 0) {
      const start = chars.slice(register.step);
      const end = chars.slice(0, register.step);
      // TODO: Use the spread operator
      chars = start.concat(end).slice(0, 30);
    }
    const text = chars.join('');
    return <CharacterString onMouseDown={this.handleMouseDown}>
      {text}
    </CharacterString>;
  }
}

module.exports = connect(state => state.marquee)(Marquee);
