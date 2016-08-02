// Dynamically set the css background images for all the sprites
import React from 'react';
import {connect} from 'react-redux';

const Skin = (props) => {
  return <style type='text/css'>
    {props.skinCss}
  </style>;
};

module.exports = connect((state) => state.display)(Skin);
