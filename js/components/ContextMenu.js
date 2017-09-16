import React from "react";
import PropTypes from "prop-types";

import classnames from "classnames";

import "../../css/context-menu.css";

export const Hr = () => (
  <li className="hr">
    <hr />
  </li>
);

// TODO: Add down-arrow
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
    if (this.state.selected && !this.handleNode.contains(e.target)) {
      this.setState({ selected: false });
    }
  }

  render() {
    const { handle, children, top, bottom, ...passThroughProps } = this.props;
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
          <div className={classnames({ top, bottom })}>
            <ul id="context-menu">{children}</ul>
          </div>
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
