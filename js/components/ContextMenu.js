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
  componentWillMount() {
    // Clicking anywhere outside the context menu will close the window
    document.addEventListener("click", this.props.closeMenu);
  }

  componantWillUnmount() {
    document.removeEventListener("click", this.props.closeMenu);
  }

  render() {
    const { selected, top, bottom, children } = this.props;
    return (
      <div className={classnames({ selected, top, bottom })}>
        <ul id="context-menu">{children}</ul>
      </div>
    );
  }
}

ContextMenu.propTypes = {
  closeMenu: PropTypes.func.isRequired,
  children: PropTypes.any.isRequired,
  top: PropTypes.bool,
  bottom: PropTypes.bool
};
