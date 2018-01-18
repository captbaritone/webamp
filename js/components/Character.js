import React from "react";
import PropTypes from "prop-types";

export const characterClassName = char =>
  `character-${char
    .toString()
    .toLowerCase()
    .charCodeAt(0)}`;

const Character = ({ children: char, className, ...passThrough }) => (
  <span
    {...passThrough}
    className={`${className || ""} character ${characterClassName(char)}`}
  >
    {char}
  </span>
);

Character.propTypes = {
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default Character;
