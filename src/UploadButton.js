import * as React from "react";
import { connect } from "react-redux";
import * as Actions from "./redux/actionCreators";
import { SHOW_UPLOAD } from "./constants";
import UploadIcon from "./components/icons/UploadIcon";
import CloseIcon from "./components/icons/CloseIcon";

function UploadButton({ toggleUploadView, uploadViewOpen }) {
  if (!SHOW_UPLOAD) {
    return null;
  }
  return (
    <button
      onClick={() => {
        toggleUploadView();
      }}
      style={{ paddingLeft: "0.2rem", paddingRight: "0.2rem" }}
    >
      {uploadViewOpen ? (
        <CloseIcon style={{ height: "100%" }} alt="Close" />
      ) : (
        <UploadIcon style={{ height: "100%" }} alt="Upload" />
      )}
    </button>
  );
}

const mapStateToProps = (state) => ({
  uploadViewOpen: state.uploadViewOpen,
});

const mapDispatchToProps = (dispatch) => ({
  toggleUploadView() {
    dispatch(Actions.toggleUploadView());
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(UploadButton);
