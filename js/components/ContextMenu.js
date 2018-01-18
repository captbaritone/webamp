import React from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

import classnames from "classnames";

import "../../css/context-menu.css";

class Portal extends React.Component {
  constructor(props) {
    super(props);
    this._node = document.createElement("div");
    document.body.appendChild(this._node);
  }

  componentWillUnmount() {
    document.body.removeChild(this._node);
  }

  render() {
    const style = {
      position: "absolute",
      top: this.props.top,
      left: this.props.left
    };
    return createPortal(
      <div style={style}>{this.props.children}</div>,
      this._node
    );
  }
}

export const Hr = () => (
  <li className="hr">
    <hr />
  </li>
);

export const Parent = ({ children, label }) => (
  <li className="parent">
    <ul>{children}</ul>
    {label}
  </li>
);

export const LinkNode = props => (
  <li>
    <a {...props}>{props.label}</a>
  </li>
);

LinkNode.propTypes = {
  label: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired
};

export const Node = props => <li {...props}>{props.label}</li>;

Node.propTypes = {
  label: PropTypes.string.isRequired
};

export class ContextMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selected: false };
    this._handleHandleClick = this._handleHandleClick.bind(this);
    this._handleGlobalClick = this._handleGlobalClick.bind(this);
  }

  componentDidMount() {
    document.addEventListener("click", this._handleGlobalClick);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this._handleGlobalClick);
  }

  _handleHandleClick() {
    this.setState({ selected: !this.state.selected });
  }

  _handleGlobalClick(e) {
    if (
      this.state.selected &&
      // Not sure how, but it's possible for this to get called when handleNode is null/undefined.
      // https://sentry.io/share/issue/2066cd79f21e4f279791319f4d2ea35d/
      this.handleNode &&
      !this.handleNode.contains(e.target)
    ) {
      this.setState({ selected: false });
    }
  }

  render() {
    const { handle, children, top, bottom, ...passThroughProps } = this.props;
    const rect = this.handleNode
      ? this.handleNode.getBoundingClientRect()
      : { top: 0, left: 0 };
    return (
      <div {...passThroughProps}>
        <div
          className="handle"
          style={{ width: "100%", height: "100%" }}
          ref={node => (this.handleNode = node)}
          onClick={this._handleHandleClick}
        >
          {handle}
        </div>
        {this.state.selected && (
          <Portal top={rect.top} left={rect.left}>
            <ul id="context-menu" className={classnames({ top, bottom })}>
              {children}
            </ul>
          </Portal>
        )}
      </div>
    );
  }
}

ContextMenu.propTypes = {
  children: PropTypes.any.isRequired,
  handle: PropTypes.any.isRequired,
  top: PropTypes.bool,
  bottom: PropTypes.bool
};
