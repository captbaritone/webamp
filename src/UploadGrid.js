import React from "react";
import { useSelector } from "react-redux";
import { HEADING_HEIGHT } from "./constants";
import { useActionCreator } from "./hooks";
import * as Actions from "./redux/actionCreators";
import * as Selectors from "./redux/selectors";

function UploadRow({ file }) {
  const tryToUploadFile = useActionCreator(Actions.tryToUploadFile);
  function getStatus() {
    switch (file.status) {
      case "MISSING":
        return <button onClick={() => tryToUploadFile(file.id)}>Upload</button>;
      case "ARCHIVED":
        return (
          <a
            href={`https://skins.webamp.org/skin/${file.md5}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Added!
          </a>
        );
      case "FOUND":
        return (
          <a
            href={`https://skins.webamp.org/skin/${file.md5}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View
          </a>
        );
      case "UPLOADING":
        return "Uploading...";
      case "NEW":
        return "Parsing...";
      default:
        return file.status;
    }
  }
  return (
    <tr>
      <td>{getStatus()}</td>
      <td>{file.file.name}</td>
      <td>{file.status}</td>
    </tr>
  );
}

function UploadGrid() {
  const files = useSelector((state) => state.fileUploads);
  const tryToUploadAllFiles = useActionCreator(Actions.tryToUploadAllFiles);
  const canUpload = useSelector(Selectors.getFileToUpload) != null;
  return (
    <div style={{ color: "white", marginTop: HEADING_HEIGHT }}>
      {canUpload && <button onClick={tryToUploadAllFiles}>Upload All</button>}
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Filename</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(files).map((file, i) => {
            return <UploadRow key={i} file={file} />;
          })}
        </tbody>
      </table>
    </div>
  );
}
export default UploadGrid;
