import * as React from "react";
import { useSelector } from "react-redux";
import { useActionCreator } from "./hooks";
import * as Actions from "./redux/actionCreators";
import { SHOW_UPLOAD } from "./constants";
import UploadIcon from "./components/icons/UploadIcon";
import CloseIcon from "./components/icons/CloseIcon";

function UploadButton() {
  const uploadViewOpen = useSelector((state) => state.uploadViewState);
  const toggleUploadView = useActionCreator(Actions.toggleUploadView);
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

export default UploadButton;
