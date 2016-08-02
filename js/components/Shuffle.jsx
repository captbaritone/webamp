import React from 'react';
import {connect} from 'react-redux';


class Shuffle extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.props.dispatch({type: 'TOGGLE_SHUFFLE'});
  }
  render() {
    return <div
      id='shuffle'
      className={this.props.shuffle ? 'selected' : ''}
      onClick={this.handleClick}
    />;
  }
}

module.exports = connect((state) => state.media)(Shuffle);
