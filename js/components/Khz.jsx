import React from 'react';
import {connect} from 'react-redux';

import CharacterString from './CharacterString';


const Khz = (props) => <CharacterString id='khz'>
  {props.khz}
</CharacterString>;

module.exports = connect((state) => state.media)(Khz);
