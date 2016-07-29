import React from 'react';
import {connect} from 'react-redux';


class Balance extends React.Component {
  constructor(props) {
    super(props);
    this.setBalance = this.setBalance.bind(this);
    this.showMarquee = this.showMarquee.bind(this);
    this.hideMarquee = this.hideMarquee.bind(this);
  }

  setBalance(e) {
    let balance = e.target.value;
    // The balance clips to the center
    if (Math.abs(balance) < 25) {
      balance = 0;
    }
    this.props.dispatch({type: 'SET_BALANCE', balance: balance});
  }

  showMarquee() {
    this.props.dispatch({type: 'SET_FOCUS', input: 'balance'});
  }

  hideMarquee() {
    this.props.dispatch({type: 'UNSET_FOCUS'});
  }

  render() {
    const balance = Math.abs(this.props.balance) / 100;
    const sprite = Math.round(balance * 28);
    const offset = (sprite - 1) * 15;

    const style = {
      backgroundPosition: '0 -' + offset + 'px'
    };

    return <input
      id='balance'
      type='range'
      min='-100'
      max='100'
      step='1'
      value={this.props.balance}
      style={style}
      onChange={this.setBalance}
      onMouseDown={this.showMarquee}
      onMouseUp={this.hideMarquee}
    />;
  }
}

module.exports = connect(state => state.media)(Balance);
