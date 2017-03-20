import React from "react";

export const characterClassName = char =>
  `character-${char.toString().toLowerCase().charCodeAt(0)}`;

const Character = ({ children: char, id }) => (
  <div id={id} className={`character ${characterClassName(char)}`}>
    {char}
  </div>
);

Character.propTypes = {
  children: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]).isRequired
};

export default Character;
