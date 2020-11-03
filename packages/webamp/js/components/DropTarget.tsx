import { useCallback } from "react";
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
}

function supress(e: React.DragEvent<HTMLDivElement>) {
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = "link";
  e.dataTransfer.effectAllowed = "link";
}

const DropTarget = (props: Props) => {
  const {
    // eslint-disable-next-line no-shadow, no-unused-vars
    handleDrop,
    windowId,
    ...passThroughProps
  } = props;

  const droppedFiles = useActionCreator(Actions.droppedFiles);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      supress(e);
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
      {...passThroughProps}
      onDragStart={supress}
      onDragEnter={supress}
      onDragOver={supress}
      onDrop={onDrop}
    />
  );
};

export default DropTarget;
