import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';

class EqOn extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.dispatch({type: 'TOGGLE_EQ_ON'});
  }

  render() {
    const className = classnames({
      selected: this.props.on
    });
    return <div
      id='on'
      className={className}
      onClick={this.handleClick}
    />;
  }
}

module.exports = connect((state) => state.equalizer)(EqOn);
