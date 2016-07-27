import React from 'react';
import {connect} from 'react-redux';


class Repeat extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.props.dispatch({type: 'TOGGLE_REPEAT'});
  }
  render() {
    return <div
      id='repeat'
      className={this.props.repeat ? 'selected' : ''}
      onClick={this.handleClick}
    />;
  }
}

module.exports = connect(state => state.media)(Repeat);
