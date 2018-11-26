import React from "react";
import ReactDOM from "react-dom";

export class Overlay extends React.Component {
  constructor() {
    super();
    this._node = document.createElement("div");
    this._node.classList.add("overlay");
    window.document.body.appendChild(this._node);
  }

  componentWillUnmount() {
    window.document.body.removeChild(this._node);
  }
  render() {
    return ReactDOM.createPortal(this.props.children, this._node);
  }
}
