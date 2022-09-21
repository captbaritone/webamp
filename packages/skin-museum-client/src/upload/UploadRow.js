import React from "react";
import * as Utils from "../utils";
import { WINAMP_NORMAL, WINAMP_SELECTED_BG } from "../theme";

function Row({ name, loading, right, complete }) {
  return (
    <div
      style={{
        position: "relative",
        paddingTop: 2,
        paddingBottom: 2,
        fontSize: 14,
      }}
    >
      {(loading != null || complete) && (
        <div
          style={{
            backgroundColor: WINAMP_SELECTED_BG,
            position: "absolute",
            left: 0,
            top: 0,
            width: loading ? `90%` : complete ? `100%` : `0%`,
            transitionProperty: "all",
            // TODO: Try to learn how long it really takes
            transitionDuration: complete ? "200ms" : "9s",
            height: "100%",
            zIndex: 0,
          }}
        />
      )}
      <div
        style={{
          zIndex: 1,
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          color: WINAMP_NORMAL,
        }}
      >
        <span>{name}</span>
        {right && (
          <span
            style={{
              paddingLeft: 10,
              // Ensure we are wide enough that text changes won't affect the layout
              minWidth: 100,
              textAlign: "right",
            }}
          >
            {right}
          </span>
        )}
      </div>
    </div>
  );
}

function SkinLink({ md5, children }) {
  return (
    <a
      href={Utils.museumUrlFromHash(md5)}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: WINAMP_NORMAL }}
    >
      {children}
    </a>
  );
}

// TODO: This is a component
function getRight(file) {
  switch (file.status) {
    case "UPLOADED": {
      return "uploaded (...server processing)";
    }
    case "ARCHIVED":
      switch (file.skinType) {
        case "MODERN":
          return "archived";
        case "CLASSIC":
          return <SkinLink md5={file.md5}>added</SkinLink>;
        default:
          throw new Error(`Unknown skinType "${file.skinType}"`);
      }
    case "FOUND":
      switch (file.skinType) {
        case "MODERN":
          return "archived";
        case "CLASSIC":
          return <SkinLink md5={file.md5}>view</SkinLink>;
        default:
          throw new Error(`Unknown skinType "${file.skinType}"`);
      }
    case "MISSING":
      return "missing";
    case "UPLOADING":
      return "uploading...";
    case "UPLOAD_DELAYED":
      return "uploaded complete (processing scheduled)";
    case "UPLOAD_FAILED":
      return "upload failed";
    case "INVALID_ARCHIVE":
      return "corrupt";
    case "INVALID_FILE_EXTENSION":
      return "not skin";
    default:
      return file.status;
  }
}

function UploadRow({ file }) {
  return (
    <Row
      name={file.file.name}
      loading={file.status === "UPLOADING"}
      right={getRight(file)}
      complete={file.status === "ARCHIVED" || file.status === "UPLOADED"}
    />
  );
}

export default UploadRow;
