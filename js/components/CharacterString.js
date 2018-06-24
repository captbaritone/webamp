import React from "react";
import PropTypes from "prop-types";
import Character from "./Character";

class CharacterString extends React.Component {
  shouldComponentUpdate(nextProps) {
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

CharacterString.propsTypes = {
  children: PropTypes.string
};

export default CharacterString;
