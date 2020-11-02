import { useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import classnames from "classnames";

import "../../css/context-menu.css";
import { useTypedSelector } from "../hooks";
import * as Selectors from "../selectors";

interface PortalProps {
  zIndex: number;
  top: number;
  left: number;
  children: JSX.Element[] | JSX.Element;
}

const Portal = (props: PortalProps) => {
  const node: HTMLDivElement = useMemo(() => {
    const div = document.createElement("div");
    div.id = "webamp-context-menu";
    div.style.position = "absolute";
    div.style.top = "0";
    div.style.left = "0";
    div.style.zIndex = String(props.zIndex + 1);
    return div;
  }, [props.zIndex]);

  useEffect(() => {
    document.body.appendChild(node);
    return () => {
      document.body.removeChild(node);
    };
  }, [node]);

  const style: React.CSSProperties = {
    top: props.top,
    left: props.left,
    position: "absolute",
  };
  return createPortal(<div style={style}>{props.children}</div>, node);
};

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
  target?: string;
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
}

export default function ContextMenu({
  children,
  offsetTop,
  offsetLeft,
  top,
  bottom,
  selected,
}: ContextMenuProps) {
  const zIndex = useTypedSelector(Selectors.getZIndex);
  if (!selected) {
    return null;
  }
  return (
    <Portal top={offsetTop} left={offsetLeft} zIndex={zIndex}>
      <ul className={classnames("context-menu", { top, bottom })}>
        {children}
      </ul>
    </Portal>
  );
}
