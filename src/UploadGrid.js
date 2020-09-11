import React from "react";
import { useSelector } from "react-redux";
import { HEADING_HEIGHT } from "./constants";
import { useActionCreator } from "./hooks";
import * as Actions from "./redux/actionCreators";
import * as Selectors from "./redux/selectors";

function UploadGrid() {
  const files = useSelector((state) => state.fileUploads);
  const tryToUploadFile = useActionCreator(Actions.tryToUploadFile);
  const canUpload = useSelector(Selectors.getFileToUpload) != null;
  const tryToUploadAllFiles = useActionCreator(Actions.tryToUploadAllFiles);
  return (
    <div style={{ color: "white", marginTop: HEADING_HEIGHT }}>
      {canUpload && <button onClick={tryToUploadAllFiles}>Upload All</button>}
      <ul>
        {Object.values(files).map((file, i) => {
          return (
            <li key={i}>
              {file.status === "MISSING" && (
                <button onClick={() => tryToUploadFile(file.id)}>Upload</button>
              )}
              {file.file.name}: {file.status}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
export default UploadGrid;
