import React from "react";
import Character from "./Character";

interface Props {
  children: string;
}

const CharacterString = React.memo((props: Props) => {
  const text = `${props.children}` || "";
  const chars = text.split("");
  return (
    <React.Fragment>
      {chars.map((character, index) => (
        <Character key={index + character}>{character}</Character>
      ))}
    </React.Fragment>
  );
});

export default CharacterString;
