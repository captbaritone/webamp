import React, { useCallback } from "react";

interface Coord {
  x: number;
  y: number;
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  handleDrop(e: React.DragEvent<HTMLDivElement>, coord: Coord): void;
}

function supress(e: React.DragEvent<HTMLDivElement>) {
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = "link";
  e.dataTransfer.effectAllowed = "link";
}

const DropTarget = (props: Props) => {
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    supress(e);
    // TODO: We could probably move this coordinate logic into the playlist.
    // I think that's the only place it gets used.
    const { currentTarget } = e;
    if (!(currentTarget instanceof Element)) {
      return;
    }

    const { left: x, top: y } = currentTarget.getBoundingClientRect();
    props.handleDrop(e, { x, y });
  }, [props.handleDrop]);

  const {
    // eslint-disable-next-line no-shadow, no-unused-vars
    handleDrop,
    ...passThroughProps
  } = props;
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
