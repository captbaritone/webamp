import React from 'react';
import {connect} from 'react-redux';

class Shade extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.props.dispatch({type: 'TOGGLE_SHADE_MODE'});
  }
  render() {
    return <div
      id='shade'
      onClick={this.handleClick}
    />;
  }
}

module.exports = connect()(Shade);
