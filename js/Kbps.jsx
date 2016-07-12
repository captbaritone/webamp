// Single line text display that can animate and hold multiple registers
import React from 'react';
import {connect} from 'react-redux';

import CharacterString from './CharacterString.jsx';


class Kbps extends React.Component {
  render() {
    return <CharacterString id='kbps'>
      {this.props.kbps}
    </CharacterString>;
  }
}

module.exports = connect(state => state.media)(Kbps);
