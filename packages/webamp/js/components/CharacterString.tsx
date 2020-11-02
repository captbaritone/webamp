import { memo, Fragment } from "react";
import Character from "./Character";

interface Props {
  children: string;
}

const CharacterString = memo((props: Props) => {
  const text = `${props.children}` || "";
  const chars = text.split("");
  return (
    <Fragment>
      {chars.map((character, index) => (
        <Character key={index + character}>{character}</Character>
      ))}
    </Fragment>
  );
});

export default CharacterString;
