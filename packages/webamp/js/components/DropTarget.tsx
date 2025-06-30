import { useCallback, useEffect, useRef } from "react";
import { useActionCreator } from "../hooks";
import * as Actions from "../actionCreators";
import { WindowId } from "../types";

interface Coord {
  x: number;
  y: number;
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  handleDrop(e: React.DragEvent<HTMLDivElement>, coord: Coord): void;
  windowId: WindowId;
  onWheelActive?: (e: WheelEvent) => void;
}

function suppress(e: React.DragEvent<HTMLDivElement>) {
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = "link";
  e.dataTransfer.effectAllowed = "link";
}

export default function DropTarget(props: Props) {
  const {
    // eslint-disable-next-line no-shadow, no-unused-vars
    handleDrop,
    windowId,
    onWheelActive,
    ...passThroughProps
  } = props;

  const divRef = useRef<HTMLDivElement>(null);
  const droppedFiles = useActionCreator(Actions.droppedFiles);

  // Register onWheelActive as a non-passive event handler
  useEffect(() => {
    const element = divRef.current;
    if (!element || !onWheelActive) {
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      // Convert native WheelEvent to React.WheelEvent
      onWheelActive(e);
    };

    element.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
  }, [onWheelActive]);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      suppress(e);
      droppedFiles(e, windowId);
      // TODO: We could probably move this coordinate logic into the playlist.
      // I think that's the only place it gets used.
      const { currentTarget } = e;
      if (!(currentTarget instanceof Element)) {
        return;
      }

      const { left: x, top: y } = currentTarget.getBoundingClientRect();
      handleDrop(e, { x, y });
    },
    [handleDrop, droppedFiles, windowId]
  );
  return (
    <div
      ref={divRef}
      {...passThroughProps}
      onDragStart={suppress}
      onDragEnter={suppress}
      onDragOver={suppress}
      onDrop={onDrop}
    />
  );
}
