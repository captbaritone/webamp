import React from "react";

import classnames from "classnames";

import "../../css/context-menu.css";

export const Hr = () => <li className="hr"><hr /></li>;

// TODO: Add down-arrow
export const Parent = ({ children, label }) =>
  <li className="parent">
    <ul>
      {children}
    </ul>
    {label}
  </li>;

export const LinkNode = props =>
  <li>
    <a {...props}>
      {props.label}
    </a>
  </li>;

LinkNode.propTypes = {
  label: React.PropTypes.string.isRequired,
  href: React.PropTypes.string.isRequired
};

export const Node = props =>
  <li {...props}>
    {props.label}
  </li>;

Node.propTypes = {
  label: React.PropTypes.string.isRequired
};

export class ContextMenu extends React.Component {
  componentWillMount() {
    // Clicking anywhere outside the context menu will close the window
    document.addEventListener("click", this.props.closeMenu);
  }

  componantWillUnmount() {
    document.removeEventListener("click", this.props.closeMenu);
  }

  render() {
    return (
      <div
        id="option"
        className={classnames({ selected: this.props.selected })}
        onClick={this.props.toggleMenu}
      >
        <ul id="context-menu">
          {this.props.children}
        </ul>
      </div>
    );
  }
}

ContextMenu.propTypes = {
  closeMenu: React.PropTypes.func.isRequired,
  toggleMenu: React.PropTypes.func.isRequired,
  children: React.PropTypes.any.isRequired
};
