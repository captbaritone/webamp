import React from 'react';
import {connect} from 'react-redux';

import {openFileDialog} from '../actionCreators';


class Eject extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    openFileDialog(this.props.winamp);
  }
  render() {
    return <div
      id='eject'
      onClick={this.handleClick}
    />;
  }
}

module.exports = connect()(Eject);
