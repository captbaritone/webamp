import React from "react";

class DragTarget extends React.Component {
  constructor(props) {
    super(props);
    this.handleDrop = this.handleDrop.bind(this);
  }

  supress(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  handleDrop(e) {
    this.supress(e);
    this.props.handleFiles(e.dataTransfer.files);
  }

  render() {
    return (
      <div
        onDragEnter={this.supress}
        onDragOver={this.supress}
        onDrop={this.handleDrop}
      >
        {this.props.children}
      </div>
    );
  }
}

export default DragTarget;
