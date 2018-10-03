import React from "react";
import Character from "./Character";

interface Props {
  children: string;
}

class CharacterString extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return nextProps.children !== this.props.children;
  }

  render() {
    const text = `${this.props.children}` || "";
    const chars = text.split("");
    return chars.map((character, index) => (
      <Character key={index + character}>{character}</Character>
    ));
  }
}

export default CharacterString;
