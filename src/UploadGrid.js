import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { HEADING_HEIGHT } from "./constants";
import { useActionCreator } from "./hooks";
import * as Actions from "./redux/actionCreators";
import * as Utils from "./utils";

function DropTarget({ getInputProps }) {
  return (
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
      <div style={{ fontSize: 30 }}>Drop Skins Here</div>
      <br />
      <div style={{ fontSize: 20, lineHeight: 1.3 }}>
        We'll analyzed them in your browser to find <br />
        any that are missing from the museum
      </div>

      <input {...getInputProps()} />
    </div>
  );
}

function Section({ files, filter, title, render }) {
  const matches = useMemo(() => files.filter(filter), [files, filter]);
  if (matches.length === 0) {
    return null;
  }
  return (
    <>
      <h2>
        {matches.length.toLocaleString()} {title}
      </h2>
      <ul>
        {matches.map((match, i) => {
          return <li key={i}>{render(match)}</li>;
        })}
      </ul>
    </>
  );
}

function UploadGrid({ getInputProps, isDragActive }) {
  const files = useSelector((state) => state.fileUploads);
  const tryToUploadAllFiles = useActionCreator(Actions.tryToUploadAllFiles);
  const filesArr = Object.values(files);

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
        flexDirection: "column",
      }}
    >
      {isDragActive || Object.keys(files).length === 0 ? (
        <DropTarget getInputProps={getInputProps} />
      ) : (
        <div style={{ color: "white", padding: 15 }}>
          <div>
            This feature is still in beta. If you have any issues, please reach
            out to{" "}
            <a href="mailto:jordan@jordaneldredge.com">
              jordan@jordaneldredge.com
            </a>
            .
          </div>
          <h1>
            {`You've dragged in ${filesArr.length.toLocaleString()} files`}
            {filesArr.some((file) => file.status === "NEW") &&
              " (Analyzing...)"}
          </h1>
          <Section
            files={filesArr}
            title={
              <>
                are new skins!
                {filesArr.some((file) => file.status === "MISSING") && (
                  <div>
                    <button onClick={tryToUploadAllFiles}>Upload All</button>
                  </div>
                )}
              </>
            }
            filter={(file) =>
              file.status === "MISSING" ||
              file.status === "UPLOADING" ||
              file.status === "UPLOAD_FAILED" ||
              file.status === "ARCHIVED"
            }
            render={(file) => {
              switch (file.status) {
                case "MISSING":
                  return file.file.name;
                case "UPLOADING":
                  return <>{file.file.name} (🚀 Uploading...)</>;
                case "UPLOAD_FAILED":
                  return <>{file.file.name} (❌ Upload Failed)</>;
                case "ARCHIVED":
                  return (
                    <>
                      <a
                        href={Utils.museumUrlFromHash(file.md5)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.file.name}
                      </a>{" "}
                      (✅ Added!)
                    </>
                  );
                default:
                  console.error(`Unexpected file status: ${file.status}`);
                  return null;
              }
            }}
          />
          <Section
            files={filesArr}
            title="are not skins"
            filter={(file) => file.status === "INVALID_FILE_EXTENSION"}
            render={(file) => file.file.name}
          />
          <Section
            files={filesArr}
            title="Modern Skins (we're not accepting these yet"
            filter={(file) => file.status === "NOT_CLASSIC_SKIN"}
            render={(file) => file.file.name}
          />
          <Section
            files={filesArr}
            title="are already in the museum"
            filter={(file) => file.status === "FOUND"}
            render={(file) => (
              <a
                href={Utils.museumUrlFromHash(file.md5)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {file.file.name}
              </a>
            )}
          />
        </div>
      )}
    </div>
  );
}
export default UploadGrid;
