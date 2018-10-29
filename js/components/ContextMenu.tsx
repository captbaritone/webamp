import invariant from "invariant";
import React from "react";
import { createPortal } from "react-dom";
import { connect } from "react-redux";
import classnames from "classnames";

import "../../css/context-menu.css";
import { AppState } from "../types";

interface PortalProps {
  zIndex: number;
  top: number;
  left: number;
}

class Portal extends React.Component<PortalProps> {
  _node?: HTMLDivElement;

  componentWillMount() {
    this._node = document.createElement("div");
    this._node.id = "webamp-context-menu";
    this._node.style.position = "absolute";
    this._node.style.top = "0";
    this._node.style.left = "0";
    this._node.style.zIndex = String(this.props.zIndex + 1);
    document.body.appendChild(this._node);
  }

  componentWillUnmount() {
    if (this._node) {
      document.body.removeChild(this._node);
    }
  }

  render() {
    const style: React.CSSProperties = {
      top: this.props.top,
      left: this.props.left,
      position: "absolute"
    };
    return createPortal(
      <div style={style}>{this.props.children}</div>,
      this._node!
    );
  }
}

export const Hr = () => (
  <li className="hr">
    <hr />
  </li>
);

interface ParentProps {
  label: string;
  children: React.ReactNode;
}

export const Parent = ({ children, label }: ParentProps) => (
  <li className="parent">
    <ul>{children}</ul>
    {label}
  </li>
);

interface LinkNodeProps {
  label: string;
  href: string;
}

export const LinkNode = (props: LinkNodeProps) => (
  <li>
    <a {...props}>{props.label}</a>
  </li>
);

interface NodeProps {
  label: string;
  checked?: boolean;
  hotkey?: string;
  className?: string;
  // TODO: Figure out how to do passthrough props
  onClick?: () => void;
}

export const Node = (props: NodeProps) => {
  const { label, checked, className = "", ...passThroughProps } = props;
  return (
    <li className={classnames(className, { checked })} {...passThroughProps}>
      {label}
    </li>
  );
};

interface ContextMenuProps {
  children: React.ReactNode;
  offsetTop: number;
  offsetLeft: number;
  top?: boolean;
  bottom?: boolean;
  // TODO: Remove this. Just conditionally render in the parent.
  selected: boolean;
  zIndex: number;
}

class ContextMenu extends React.Component<ContextMenuProps> {
  render() {
    const {
      children,
      offsetTop,
      offsetLeft,
      top,
      bottom,
      selected,
      zIndex
    } = this.props;
    return (
      selected && (
        <Portal top={offsetTop} left={offsetLeft} zIndex={zIndex}>
          <ul className={classnames("context-menu", { top, bottom })}>
            {children}
          </ul>
        </Portal>
      )
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  zIndex: state.display.zIndex
});

export default connect(mapStateToProps)(ContextMenu);
