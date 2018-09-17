import React from "react";

interface Props {
  children: string | number;
  className?: string;
}

export const characterClassName = (char: string | number) =>
  `character-${char
    .toString()
    .toLowerCase()
    .charCodeAt(0)}`;

const Character = ({ children: char, className, ...passThrough }: Props) => (
  <span
    {...passThrough}
    className={`${className || ""} character ${characterClassName(char)}`}
  >
    {char}
  </span>
);

export default Character;
