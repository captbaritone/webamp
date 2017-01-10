import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';

import {TOGGLE_EQ_AUTO} from '../actionTypes';

class EqAuto extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.dispatch({type: TOGGLE_EQ_AUTO});
  }

  render() {
    const className = classnames({
      selected: this.props.auto
    });
    return <div
      id='auto'
      className={className}
      onClick={this.handleClick}
    />;
  }
}

module.exports = connect((state) => state.equalizer)(EqAuto);
