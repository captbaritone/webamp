import React from "react";
import classnames from "classnames";

export default class ClickedDiv extends React.Component {
  constructor(props) {
    super(props);
    this.state = { clicked: false };
  }
  render() {
    return (
      <div
        {...this.props}
        className={classnames(this.props.className, this.state)}
        onMouseDown={() => {
          if (!this.state.clicked) {
            this.setState({ clicked: true });
          }
          if (this.props.onMouseDown) {
            this.props.onMouseDown();
          }
        }}
      />
    );
  }
}
