import React from "react";
import { useSelector } from "react-redux";
import { useActionCreator } from "./hooks";
import * as Actions from "./redux/actionCreators";
import { SHOW_UPLOAD } from "./constants";
import UploadIcon from "./components/icons/UploadIcon";
import CloseIcon from "./components/icons/CloseIcon";
import { promptForFileReferences } from "./utils";
import * as Selectors from "./redux/selectors";

function UploadButton() {
  const uploadViewOpen = useSelector(Selectors.getHaveUploadFiles);
  const gotFiles = useActionCreator(Actions.gotFiles);
  const closeUploadFiles = useActionCreator(Actions.closeUploadFiles);

  if (!SHOW_UPLOAD) {
    return null;
  }

  const style = { paddingLeft: "0.2rem", paddingRight: "0.2rem" };
  if (uploadViewOpen) {
    return (
      <button
        onClick={() => {
          const areSure = window.confirm("Are you sure you're done uploading?");
          if (areSure) {
            closeUploadFiles();
          }
        }}
        style={style}
      >
        <CloseIcon style={{ height: "100%" }} alt="Close" />
      </button>
    );
  } else {
    return (
      <button
        onClick={async () => {
          const fileList = await promptForFileReferences({
            accept: ".wsz,.zip",
          });
          gotFiles(Array.from(fileList));
        }}
        style={style}
      >
        <UploadIcon style={{ height: "100%" }} alt="Upload" />
      </button>
    );
  }
}

export default UploadButton;
