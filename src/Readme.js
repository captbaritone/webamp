import React from "react";
import { connect } from "react-redux";
import { switchMap } from "rxjs/operators";
import { from } from "rxjs";
import Disposable from "./Disposable";

class Readme extends React.Component {
  constructor(props) {
    super(props);
    this._disposable = new Disposable();
    this.state = { focusedFile: null };
  }

  componentDidMount() {}

  componentDidUpdate(_, oldState) {}

  componentWillUnmount() {
    this._disposable.dispose();
  }

  async _focusFile(fileName) {
    if (this.props.zip == null) {
      return;
    }

    const file = await this.props.zip.file(fileName);
    const type = fileName
      .split(".")
      .pop()
      .toLowerCase();
    const methodFromType = {
      txt: "string",
      bmp: "blob",
      cur: "blob"
    };
    let content = await file.async(methodFromType[type]);
    this.setState({ focusedFile: { fileName, type, content } });
  }

  _renderFocusedFile() {
    if (this.state.focusedFile == null) {
      return;
    }

    switch (this.state.focusedFile.type) {
      case "txt":
        return (
          <textarea
            style={{
              width: "100%",
              height: "300px"
            }}
          >
            {this.state.focusedFile.content}
          </textarea>
        );
      case "bmp":
      case "cur":
        const mimeType = `image/cur`;
        const content = URL.createObjectURL(
          new Blob([this.state.focusedFile.content], { type: mimeType })
        );
        return <img src={content} />;
    }
  }

  render() {
    return (
      <div
        style={{
          position: "fixed",
          width: 500,
          left: 0,
          height: "100%",
          backgroundColor: "white",
          overflow: "scroll"
        }}
      >
        <ul style={{ float: "left" }}>
          {this.props.zip &&
            Object.keys(this.props.zip.files).map(fileName => (
              <li
                key={fileName}
                style={{
                  fontWeight:
                    this.state.focusedFile &&
                    this.state.focusedFile.fileName === fileName
                      ? "bold"
                      : "normal"
                }}
              >
                <a onClick={() => this._focusFile(fileName)}>{fileName}</a>
              </li>
            ))}
        </ul>
        <div style={{ float: "left" }}>{this._renderFocusedFile()}</div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    zip: state.skinZip
  };
}

export default connect(mapStateToProps)(Readme);
