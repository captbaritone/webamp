import React from "react";
import classnames from "classnames";

interface Props {}

interface State {
  hover: boolean;
}
let cursorX: number;
let cursorY: number;
window.document.addEventListener("mousemove", e => {
  cursorX = e.pageX;
  cursorY = e.pageY;
});

// We implement hover ourselves, because we hate ourselves and https://stackoverflow.com/a/13259049/1263117
export default class PlaylistMenuEntry extends React.Component<Props, State> {
  node?: HTMLLIElement | null;
  constructor(props: Props) {
    super(props);
    this.state = { hover: false };
  }

  componentDidMount() {
    if (this.node == null) {
      return;
    }
    const domRect = this.node.getBoundingClientRect();
    this.setState({
      hover:
        cursorX >= domRect.left &&
        cursorX <= domRect.right &&
        cursorY >= domRect.top &&
        cursorY <= domRect.bottom,
    });
  }

  render() {
    return (
      <li
        ref={node => (this.node = node)}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
        className={classnames({ hover: this.state.hover })}
      >
        {this.props.children}
      </li>
    );
  }
}
