import { useState, useRef, useEffect, useMemo } from "react";
import ContextMenu from "./ContextMenu";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  renderMenu: () => React.ReactNode;
  // Accessible name of the button which opens the menu.
  label: string;
  top?: boolean;
  bottom?: boolean;
}

function getNodeOffset(node: HTMLDivElement | null) {
  if (node == null) {
    return { top: 0, left: 0 };
  }

  const rect = node.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement!.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement!.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
}

// Trigger a context menu relative to the child element when the user
// left-clicks on the child.
//
// For a component that triggers relative to the user's cursor on right-click
// see `<ContextMenuWrapper />`.
function ContextMenuTarget(props: Props) {
  const handleNode = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(false);
  const [openedWithKeyboard, setOpenedWithKeyboard] = useState(false);
  useEffect(() => {
    if (!selected) {
      return;
    }
    function handleGlobalClick(e: MouseEvent) {
      if (
        selected &&
        // Typescript does not believe that these click events are always fired on DOM nodes.
        e.target instanceof Element &&
        selected &&
        // Not sure how, but it's possible for this to get called when handleNode is null/undefined.
        // https://sentry.io/share/issue/2066cd79f21e4f279791319f4d2ea35d/
        handleNode.current &&
        !handleNode.current.contains(e.target!)
      ) {
        setSelected(false);
      }
    }
    document.addEventListener("click", handleGlobalClick);
    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [selected]);

  const offset = useMemo(() => {
    return selected
      ? getNodeOffset(handleNode.current)
      : // Kinda awkward. This is a nonsense return value since we only use
        //this value when we are selected.
        { top: 0, left: 0 };
  }, [selected]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) {
      return;
    }
    switch (e.key) {
      case "Enter":
      case " ":
      case "ArrowDown":
        setOpenedWithKeyboard(true);
        setSelected(true);
        break;
      case "Escape":
        setSelected(false);
        break;
      default:
        return;
    }
    e.preventDefault();
    // Don't let global hotkeys (e.g. arrow keys) also handle this.
    e.stopPropagation();
  }

  function closeMenu() {
    setSelected(false);
    handleNode.current?.focus();
  }

  const { renderMenu, children, top, bottom, label, ...passThroughProps } =
    props;
  return (
    <div {...passThroughProps}>
      <div
        className="handle"
        style={{ width: "100%", height: "100%" }}
        ref={handleNode}
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={selected}
        onKeyDown={handleKeyDown}
        onClick={() => {
          setOpenedWithKeyboard(false);
          setSelected(!selected);
        }}
      >
        {children}
      </div>
      <ContextMenu
        selected={selected}
        offsetTop={offset.top}
        offsetLeft={offset.left}
        top={top}
        bottom={bottom}
        focusFirstItem={openedWithKeyboard}
        onClose={closeMenu}
      >
        {renderMenu()}
      </ContextMenu>
    </div>
  );
}

export default ContextMenuTarget;
