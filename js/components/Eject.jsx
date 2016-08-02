import React from 'react';
import {connect} from 'react-redux';


class Eject extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.props.dispatch({type: 'OPEN_FILE_DIALOG'});
  }
  render() {
    return <div
      id='eject'
      onClick={this.handleClick}
    />;
  }
}

module.exports = connect()(Eject);
