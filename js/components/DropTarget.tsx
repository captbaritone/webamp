import React from "react";

interface Coord {
  x: number;
  y: number;
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  handleDrop(e: React.DragEvent<HTMLDivElement>, coord: Coord): void;
}

export default class DropTarget extends React.Component<Props> {
  supress(e: React.DragEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "link";
    e.dataTransfer.effectAllowed = "link";
  }

  handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    this.supress(e);
    // TODO: We could probably move this coordinate logic into the playlist.
    // I think that's the only place it gets used.
    const { currentTarget } = e;
    if (!(currentTarget instanceof Element)) {
      return;
    }

    const { left: x, top: y } = currentTarget.getBoundingClientRect();
    this.props.handleDrop(e, { x, y });
  };

  render() {
    const {
      // eslint-disable-next-line no-shadow, no-unused-vars
      handleDrop,
      ...passThroughProps
    } = this.props;
    return (
      <div
        {...passThroughProps}
        onDragStart={this.supress}
        onDragEnter={this.supress}
        onDragOver={this.supress}
        onDrop={this.handleDrop}
      />
    );
  }
}
