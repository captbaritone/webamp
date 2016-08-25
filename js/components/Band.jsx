import React from 'react';
import {connect} from 'react-redux';

// Given a value between 1-100, return the sprite number (0-27)
export const spriteNumber = (value) => {
  const percent = value / 100;
  return Math.round(percent * 27);
};

// Given a sprite number, return the x,y
export const spriteOffsets = (number) => {
  const x = number % 14;
  const y = Math.floor(number / 14);
  return {x, y};
};

const Band = (props) => {
  const value = props[props.band];
  const offset = spriteOffsets(spriteNumber(value));
  const xOffset = offset.x * 15; // Each sprite is 15px wide
  const yOffset = offset.y * 65; // Each sprite is 15px tall

  const style = {
    backgroundPosition: `-${xOffset}px -${yOffset}px`
  };

  return <div id={props.id} className='band' style={style}>
    <input
      type='range'
      min='0'
      max='100'
      step='1'
      value={value}
      onChange={props.onChange}
    />
  </div>;
};

export default connect((state) => state.equalizer.sliders)(Band);
