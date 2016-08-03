import React from 'react';
import {connect} from 'react-redux';

import {toggleRepeat} from '../actionCreators';


class Repeat extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.props.dispatch(toggleRepeat(this.props.mediaPlayer));
  }
  render() {
    return <div
      id='repeat'
      className={this.props.repeat ? 'selected' : ''}
      onClick={this.handleClick}
    />;
  }
}

module.exports = connect((state) => state.media)(Repeat);
