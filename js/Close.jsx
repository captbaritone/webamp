import React from 'react';
import {connect} from 'react-redux';


class Close extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.props.dispatch({type: 'CLOSE'});
  }
  render() {
    return <div
      id='close'
      onClick={this.handleClick}
    />;
  }
}

module.exports = connect()(Close);
