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

const Character = ({
  children: char,
  className,
  ...passThrough
}: Props &
  // TODO: Seems like there should be a better way to do pass through props
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  >) => (
  <span
    {...passThrough}
    className={`${className || ""} character ${characterClassName(char)}`}
  >
    {char}
  </span>
);

export default Character;
