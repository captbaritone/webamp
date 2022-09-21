import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { HEADING_HEIGHT } from "../constants";
import { useActionCreator } from "../hooks";
import * as Actions from "../redux/actionCreators";
import DropTarget from "../DropTarget";
import UploadSection from "./UploadSection";

function useBucketed(filesArr) {
  return useMemo(() => {
    const missing = [];
    const notSkins = [];
    const foundSkins = [];
    filesArr.forEach((file) => {
      switch (file.status) {
        case "MISSING":
        case "UPLOADING":
        case "UPLOAD_FAILED":
        case "UPLOAD_DELAYED":
        case "ARCHIVED":
        case "UPLOADED":
          missing.push(file);
          break;
        case "INVALID_FILE_EXTENSION":
        case "INVALID_ARCHIVE":
          notSkins.push(file);
          break;
        case "FOUND":
          foundSkins.push(file);
          break;
        default:
      }
    });
    return { missing, notSkins, foundSkins };
  }, [filesArr]);
}

function Plural({ count, single, plural }) {
  return count === 1 ? single : plural;
}

function Inner({ files }) {
  const tryToUploadAllFiles = useActionCreator(Actions.tryToUploadAllFiles);
  const filesArr = Object.values(files);
  const { missing, notSkins, foundSkins } = useBucketed(filesArr);

  const analyzing = filesArr.some((file) => file.status === "NEW");

  if (analyzing) {
    return (
      <h1>
        Analyzing {filesArr.length.toLocaleString()}{" "}
        <Plural count={filesArr.length} single="file" plural="files" />
        ...
      </h1>
    );
  }

  const stillHaveFilesToUpload = filesArr.some(
    (file) => file.status === "MISSING" || file.status === "UPLOADING"
  );

  /* TODO: Invite the user to Discord if they upload more than n
  const uploadedCount = filesArr.filter((file) => file.status === "ARCHIVED")
    .length;
  */

  const filesToUpload = missing.length;

  const getTitle = () => {
    if (filesToUpload > 0) {
      if (stillHaveFilesToUpload) {
        return (
          <>
            Found {filesToUpload.toLocaleString()}{" "}
            <Plural single="skin" plural="skins" count={filesToUpload} /> to
            upload
          </>
        );
      } else {
        return `Thanks for your contribution!`;
      }
    }
    return `No missing skins found`;
  };

  return (
    <div style={{ maxWidth: 600, minWidth: 400, lineHeight: 1.2 }}>
      <h1>{getTitle()}</h1>
      <UploadSection
        title="Missing from the museum"
        extra={
          stillHaveFilesToUpload && (
            <button
              onClick={tryToUploadAllFiles}
              style={{ marginRight: 0, height: 30, fontWeight: "bold" }}
            >
              Upload All
            </button>
          )
        }
        files={missing}
      />
      <UploadSection title="Invalid" files={notSkins} />
      <UploadSection title="Already collected" files={foundSkins} />
    </div>
  );
}

function UploadGrid({ getInputProps, isDragActive, ...props }) {
  const files = useSelector((state) => state.fileUploads);
  return (
    <div
      style={{
        position: "absolute",
        top: HEADING_HEIGHT,
        left: 0,
        bottom: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        color: "lightgrey",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {isDragActive || Object.keys(files).length === 0 ? (
        <DropTarget getInputProps={getInputProps} />
      ) : (
        <div style={{ padding: 15, display: "flex", justifyContent: "center" }}>
          <Inner files={files} {...props} />
        </div>
      )}
    </div>
  );
}
export default UploadGrid;
