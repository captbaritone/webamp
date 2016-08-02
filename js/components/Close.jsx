import React from 'react';
import {connect} from 'react-redux';

import {close} from '../actionCreators';


class Close extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.props.dispatch(close(this.props.mediaPlayer));
  }
  render() {
    return <div
      id='close'
      onClick={this.handleClick}
    />;
  }
}

module.exports = connect()(Close);
