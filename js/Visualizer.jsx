import React from 'react';
import {connect} from 'react-redux';

class Visualizer extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.dispatch({type: 'TOGGLE_VISUALIZER'});
  }
  render() {
    return <canvas
      onClick={this.handleClick}
      id='visualizer'
      width='152'
      height='32'
    />;
  }
}

module.exports = connect((state) => state)(Visualizer);
