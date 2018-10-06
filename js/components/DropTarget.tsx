import React from "react";

interface Coord {
  x: number;
  y: number;
}

interface Props {
  loadFilesFromReferences: () => void;
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
    const { target } = e;
    if (!(target instanceof Element)) {
      return;
    }

    const { left: x, top: y } = target.getBoundingClientRect();
    this.props.handleDrop(e, { x, y });
  };

  render() {
    const {
      // eslint-disable-next-line no-shadow, no-unused-vars
      loadFilesFromReferences,
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
