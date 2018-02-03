import React from "react";
import classnames from "classnames";

// Winamp has a strange behavior for the buttons at the top of the main window.
// It shows through to the main background sprite until the first time that it's
// clicked, and then it shows the dedicated undepressed sprite thereafter.
// This component is an abstraction that tracks if a div has ever been clicked.
// Look in `skinSelectors` for CSS selectors that look like `#some-id.clicked`
// for examples of this functionality in use.
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
