// Single line text display that can animate and hold multiple registers
import React from 'react';
import {connect} from 'react-redux';

import CharacterString from './CharacterString.jsx';


class Khz extends React.Component {
  render() {
    return <CharacterString id='khz'>
      {this.props.khz}
    </CharacterString>;
  }
}

module.exports = connect(state => state.media)(Khz);
