import React from "react";
import { connect } from "react-redux";

import { loadFilesFromReferences } from "../actionCreators";

export class DropTarget extends React.Component {
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
    const { files } = e.dataTransfer;
    this.props.loadFilesFromReferences(files);
  }

  render() {
    // eslint-disable-next-line no-shadow, no-unused-vars
    const { loadFilesFromReferences, ...passThroughProps } = this.props;
    return (
      <div
        {...passThroughProps}
        onDragEnter={this.supress}
        onDragOver={this.supress}
        onDrop={this.handleDrop}
      />
    );
  }
}

export default connect(null, { loadFilesFromReferences })(DropTarget);
