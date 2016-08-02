import React from 'react';
import {connect} from 'react-redux';

import CharacterString from './CharacterString.jsx';


const Kbps = (props) => {
  return <CharacterString id='kbps'>
    {props.kbps}
  </CharacterString>;
};

module.exports = connect((state) => state.media)(Kbps);
