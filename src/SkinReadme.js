import React from "react";
import { connect } from "react-redux";
import * as Actions from "./redux/actionCreators";

class SkinReadme extends React.Component {
  render() {
    if (this.props.focusedFile == null) {
      return null;
    }

    const { ext, fileName, content } = this.props.focusedFile;
    if (content == null) {
      return null;
    }
    return (
      <div
        style={{
          position: "fixed",
          backgroundColor: "white",
          overflow: "scroll",
          ...this.props.style,
        }}
      >
        <h2>{fileName}</h2>
        <div>
          <div
            className={"readme"}
            style={{
              width: "100%",
              height: "300px",
            }}
          >
            <pre>{content}</pre>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    zip: state.skinZip,
    focusedFile: state.focusedSkinFile,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    selectSkinFile(fileName) {
      dispatch(Actions.selectSkinFile(fileName));
    },
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SkinReadme);
