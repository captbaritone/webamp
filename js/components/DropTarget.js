import React from "react";

export default class DropTarget extends React.Component {
  constructor(props) {
    super(props);
    this.handleDrop = this.handleDrop.bind(this);
    this._ref = this._ref.bind(this);
  }

  supress(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    e.dataTransfer.effectAllowed = "copyMove";
  }

  handleDrop(e) {
    this.supress(e);
    if (!this._node) {
      return;
    }
    const { x, y } = this._node.getBoundingClientRect();
    this.props.handleDrop(e, { x, y });
  }

  _ref(node) {
    this._node = node;
  }

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
        ref={this._ref}
      />
    );
  }
}
