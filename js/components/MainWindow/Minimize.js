import React from "react";
import classnames from "classnames";

export default class Minimize extends React.Component {
  constructor(props) {
    super(props);
    this.state = { clicked: false };
  }
  render() {
    return (
      <div
        id="minimize"
        className={classnames(this.state)}
        onClick={() => {
          if (!this.state.clicked) {
            this.setState({ clicked: true });
          }
        }}
        title="Minimize"
      />
    );
  }
}
