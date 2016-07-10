// Single line text display that can animate and hold multiple registers
import React from 'react';
import {connect} from 'react-redux';


class Marquee extends React.Component {
  constructor(props) {
    super(props);
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

  render() {
    const register = this.selectedRegister();
    let chars = register.text.split('');
    if (chars.length > 30 && register.step > 0) {
      const start = chars.slice(register.step);
      const end = chars.slice(0, register.step);
      // TODO: Use the spread operator
      chars = start.concat(end).slice(0, 30);
    }
    return <div>
    {chars.map(character => {
      // TODO: Standarize how we get a characer class name
      const className = 'character character-' + character.toLowerCase().charCodeAt(0);
      return <div className={className}>{character}</div>;
    })}
    </div>;
  }
}

module.exports = connect(state => state.marquee)(Marquee);
