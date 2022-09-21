import React from "react";
import { useSelector } from "react-redux";
import { useActionCreator } from "./hooks";
import * as Actions from "./redux/actionCreators";
import UploadIcon from "./components/icons/UploadIcon";
import CloseIcon from "./components/icons/CloseIcon";
import * as Selectors from "./redux/selectors";

function UploadButton() {
  const uploadViewOpen = useSelector(Selectors.getUploadViewOpen);
  const closeUploadFiles = useActionCreator(Actions.closeUploadFiles);
  const requestedUploadPage = useActionCreator(Actions.requestedUploadPage);

  const style = {
    paddingLeft: "0.2rem",
    paddingRight: "0.2rem",
  };

  // TODO: Make these buttons links.
  if (uploadViewOpen) {
    return (
      <button
        title="Close"
        onClick={() => {
          closeUploadFiles();
        }}
        style={style}
      >
        <CloseIcon style={{ height: "100%" }} alt="Close" />
      </button>
    );
  } else {
    return (
      <button
        title="Upload"
        onClick={(e) => {
          e.preventDefault();
          requestedUploadPage();
        }}
        style={style}
      >
        <UploadIcon style={{ height: "100%" }} alt="Upload" />
      </button>
    );
  }
}

export default UploadButton;
