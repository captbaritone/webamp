import React from "react";
import ReactDOM from "react-dom";

export default class Desktop extends React.Component {
  _desktopNode?: HTMLElement;
  componentWillUnmount() {
    document.body.removeChild(this._desktopNode);
    this._desktopNode = null;
  }

  _getNode() {
    if (this._desktopNode == null) {
      this._desktopNode = document.createElement("div");
      this._desktopNode.classList.add("webamp-desktop");
      document.body.appendChild(this._desktopNode);
    }
    return this._desktopNode;
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this._getNode());
  }
}
