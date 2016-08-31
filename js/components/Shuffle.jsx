import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';


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
      className={classnames({selected: this.props.shuffle})}
      onClick={this.handleClick}
    />;
  }
}

module.exports = connect((state) => state.media)(Shuffle);
