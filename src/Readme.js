import React from "react";
import { connect } from "react-redux";
import * as Actions from "./redux/actionCreators";

class Readme extends React.Component {
  _renderFocusedFile() {
    if (this.props.focusedFile == null) {
      return;
    }

    const { ext, fileName, content } = this.props.focusedFile;
    if (content == null) {
      return;
    }

    switch (ext) {
      case "txt":
        return (
          <textarea
            style={{
              width: "100%",
              height: "300px"
            }}
            defaultValue={content}
          />
        );
      case "bmp":
      case "cur":
        const mimeType = `image/${ext}`;
        const url = URL.createObjectURL(
          new Blob([content], { type: mimeType })
        );
        return <img src={url} alt={fileName} />;
      default:
        return null;
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
        <select onChange={e => this.props.selectSkinFile(e.target.value)}>
          {this.props.zip &&
            Object.keys(this.props.zip.files).map(fileName => (
              <option
                key={fileName}
                value={fileName}
                selected={
                  this.props.focusedFile &&
                  this.props.focusedFile.fileName === fileName
                }
              >
                {fileName}
              </option>
            ))}
        </select>
        <div>{this._renderFocusedFile()}</div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    zip: state.skinZip,
    focusedFile: state.focusedSkinFile
  };
}

function mapDispatchToProps(dispatch) {
  return {
    selectSkinFile(fileName) {
      dispatch(Actions.selectSkinFile(fileName));
    }
  };
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Readme);
