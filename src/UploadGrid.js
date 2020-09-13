import React from "react";
import { useSelector } from "react-redux";
import { HEADING_HEIGHT } from "./constants";
import { useActionCreator } from "./hooks";
import * as Actions from "./redux/actionCreators";
import * as Selectors from "./redux/selectors";
import * as Utils from "./utils";

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
      <td>
        {(file.status === "FOUND" || file.status === "ARCHIVED") && (
          <img
            src={Utils.screenshotUrlFromHash(file.md5)}
            alt={file.file.name}
            style={{ height: 100 }}
          />
        )}
      </td>
    </tr>
  );
}

function UploadGrid({ getInputProps, isDragActive }) {
  const files = useSelector((state) => state.fileUploads);
  const tryToUploadAllFiles = useActionCreator(Actions.tryToUploadAllFiles);
  const canUpload = useSelector(Selectors.getFileToUpload) != null;
  return (
    <div
      style={{
        position: "absolute",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        top: HEADING_HEIGHT,
        left: 0,
        bottom: 0,
        right: 0,
        display: "flex",
      }}
    >
      {isDragActive || Object.keys(files).length === 0 ? (
        <div
          style={{
            margin: 20,
            flexGrow: 1,
            border: "8px dashed #FFF",
            borderRadius: 20,
            color: "grey",
            textAlign: "center",
            vericalAlign: "middle",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            fontSize: 30,
          }}
        >
          Drop Skins Here
          <input {...getInputProps()} />
        </div>
      ) : (
        <>
          {canUpload && (
            <button onClick={tryToUploadAllFiles}>Upload All</button>
          )}
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
        </>
      )}
    </div>
  );
}
export default UploadGrid;
