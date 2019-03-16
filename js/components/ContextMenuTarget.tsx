import React, { useState, useRef, useEffect, useMemo } from "react";
import ContextMenu from "./ContextMenu";

type DivProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  handle: React.ReactNode;
  top?: boolean;
  bottom?: boolean;
}
interface State {
  selected: boolean;
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

function ContextMenuTarget(props: Props) {
  const handleNode = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(false);
  useEffect(() => {
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
  }, [selected, handleNode.current]);

  const offset = useMemo(() => {
    return getNodeOffset(handleNode.current);
  }, [selected, handleNode.current]);

  const { handle, children, top, bottom, ...passThroughProps } = props;
  return (
    <div {...passThroughProps}>
      <div
        className="handle"
        style={{ width: "100%", height: "100%" }}
        ref={handleNode}
        onClick={() => setSelected(!selected)}
      >
        {handle}
      </div>
      <ContextMenu
        selected={selected}
        offsetTop={offset.top}
        offsetLeft={offset.left}
        top={top}
        bottom={bottom}
      >
        {children}
      </ContextMenu>
    </div>
  );
}

export default ContextMenuTarget;
