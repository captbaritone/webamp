import { useMemo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import classnames from "classnames";

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

const MENU_ITEM_SELECTOR = '[role="menuitem"], [role="menuitemcheckbox"]';

// The menu items which are direct children of `menu`.
function getMenuItems(menu: Element): HTMLElement[] {
  return Array.from(menu.children).filter((child) =>
    child.matches(MENU_ITEM_SELECTOR)
  ) as HTMLElement[];
}

export const Hr = () => (
  <li className="hr" role="separator">
    <hr />
  </li>
);

interface ParentProps {
  label: string;
  children: React.ReactNode;
}

export const Parent = ({ children, label }: ParentProps) => {
  // Submenus open on hover via CSS. Keyboard users open them explicitly.
  const [expanded, setExpanded] = useState(false);
  const submenuRef = useRef<HTMLUListElement>(null);
  const focusFirstChildRef = useRef(false);

  useEffect(() => {
    if (expanded && focusFirstChildRef.current && submenuRef.current) {
      focusFirstChildRef.current = false;
      getMenuItems(submenuRef.current)[0]?.focus();
    }
  }, [expanded]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLLIElement>) {
    const target = e.target as HTMLElement;
    if (target === e.currentTarget) {
      if (e.key !== "ArrowRight" && e.key !== "Enter" && e.key !== " ") {
        return;
      }
      focusFirstChildRef.current = true;
      setExpanded(true);
    } else {
      // A key pressed within our submenu.
      if (e.key !== "ArrowLeft" && e.key !== "Escape") {
        return;
      }
      setExpanded(false);
      e.currentTarget.focus();
    }
    e.preventDefault();
    e.stopPropagation();
  }

  function handleBlur(e: React.FocusEvent<HTMLLIElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setExpanded(false);
    }
  }

  return (
    <li
      className={classnames("parent", { expanded })}
      role="menuitem"
      tabIndex={-1}
      aria-label={label}
      aria-haspopup="menu"
      aria-expanded={expanded}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <ul role="menu" aria-label={label} ref={submenuRef}>
        {children}
      </ul>
      {label}
    </li>
  );
};

interface LinkNodeProps {
  label: string;
  href: string;
  target?: string;
}

export const LinkNode = (props: LinkNodeProps) => (
  <li role="menuitem" tabIndex={-1}>
    <a {...props} tabIndex={-1}>
      {props.label}
    </a>
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
    <li
      className={classnames(className, { checked })}
      role={checked == null ? "menuitem" : "menuitemcheckbox"}
      aria-checked={checked}
      // Explicitly label the item so the CSS checkmark is not included.
      aria-label={label}
      tabIndex={-1}
      {...passThroughProps}
    >
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
  // Focus the first item when the menu opens, e.g. if it was opened with the
  // keyboard.
  focusFirstItem?: boolean;
  // Called when the user closes the menu with the keyboard, or activates an item
  // with the keyboard.
  onClose?: () => void;
}

export default function ContextMenu({
  children,
  offsetTop,
  offsetLeft,
  top,
  bottom,
  selected,
  focusFirstItem,
  onClose,
}: ContextMenuProps) {
  const zIndex = useTypedSelector(Selectors.getZIndex);
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (selected && focusFirstItem && menuRef.current) {
      getMenuItems(menuRef.current)[0]?.focus();
    }
  }, [selected, focusFirstItem]);

  if (!selected) {
    return null;
  }

  // Keyboard navigation for this menu and its submenus. Opening and closing
  // submenus is handled by `<Parent />`.
  function handleKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    const item = (e.target as Element).closest<HTMLElement>(MENU_ITEM_SELECTOR);
    const menu = item?.parentElement;
    if (item == null || menu == null) {
      return;
    }
    const items = getMenuItems(menu);
    const index = items.indexOf(item);
    switch (e.key) {
      case "ArrowDown":
        items[(index + 1) % items.length].focus();
        break;
      case "ArrowUp":
        items[(index - 1 + items.length) % items.length].focus();
        break;
      case "Home":
        items[0].focus();
        break;
      case "End":
        items[items.length - 1].focus();
        break;
      case "Enter":
      case " ":
        (item.querySelector("a") ?? item).click();
        onClose?.();
        break;
      case "Escape":
      case "Tab":
        onClose?.();
        break;
      default:
        return;
    }
    e.preventDefault();
    // Don't let global hotkeys (e.g. arrow keys) also handle this.
    e.stopPropagation();
  }

  return (
    <Portal top={offsetTop} left={offsetLeft} zIndex={zIndex}>
      <ul
        className={classnames("context-menu", { top, bottom })}
        role="menu"
        ref={menuRef}
        onKeyDown={handleKeyDown}
      >
        {children}
      </ul>
    </Portal>
  );
}
