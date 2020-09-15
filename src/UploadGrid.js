import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { HEADING_HEIGHT } from "./constants";
import { useActionCreator } from "./hooks";
import * as Actions from "./redux/actionCreators";
import * as Utils from "./utils";
import DropTarget from "./DropTarget";

function Section({ files, title, render, open = false }) {
  if (files.length === 0) {
    return null;
  }
  return (
    <details open={open}>
      <summary>
        <h2 style={{ display: "inline" }}>{title}</h2>
      </summary>
      <ul>
        {files.map((match, i) => {
          return <li key={i}>{render(match)}</li>;
        })}
      </ul>
    </details>
  );
}

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
        case "ARCHIVED":
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

  if (filesArr.some((file) => file.status === "NEW")) {
    return (
      <h1>
        Analyzing {filesArr.length.toLocaleString()}{" "}
        <Plural count={filesArr.length} single="file" plural="files" />
        ...
      </h1>
    );
  }

  return (
    <>
      <h1>
        You have <strong>{missing.length.toLocaleString()}</strong>{" "}
        <Plural count={missing.length} single="skin" plural="skins" /> that we
        are missing!
      </h1>
      {filesArr.some((file) => file.status === "MISSING") && (
        <div>
          <button onClick={tryToUploadAllFiles}>Upload All</button>
        </div>
      )}
      <table>
        <thead style={{ textAlign: "left" }}>
          <tr>
            <th>Status</th>
            <th>Filename</th>
          </tr>
        </thead>
        <tbody>
          {missing
            .map((file) => {
              const fileName = <code>{file.file.name}</code>;
              switch (file.status) {
                case "MISSING":
                  return (
                    <>
                      <td />
                      <td>{fileName}</td>
                    </>
                  );
                case "UPLOADING":
                  return (
                    <>
                      <td>🚀 Uploading...</td>
                      <td>{fileName}</td>
                    </>
                  );
                case "UPLOAD_FAILED":
                  return (
                    <>
                      <td>❌ Upload Failed</td>
                      <td>{fileName}</td>
                    </>
                  );
                case "ARCHIVED":
                  return (
                    <>
                      <td>✅ Added!</td>
                      <td>
                        {file.skinType === "CLASSIC" ? (
                          <a
                            href={Utils.museumUrlFromHash(file.md5)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {fileName}
                          </a>
                        ) : file.skinType === "MODERN" ? (
                          <>
                            {fileName} (Note: Modern skins are not yet visible
                            in the museum)
                          </>
                        ) : // TODO: Throw?
                        null}
                      </td>
                    </>
                  );
                default:
                  console.error(`Unexpected file status: ${file.status}`);
                  return null;
              }
            })
            .map((rows, i) => (
              <tr key={i}>{rows}</tr>
            ))}
        </tbody>
      </table>
      <Section
        files={notSkins}
        title={
          <>
            Files that are not valid skins ({notSkins.length.toLocaleString()})
          </>
        }
        render={(file) => <code>{file.file.name}</code>}
      />

      <Section
        files={foundSkins}
        title={
          <>Already in the museum ({foundSkins.length.toLocaleString()})</>
        }
        render={(file) => {
          if (file.skinType === "MODERN") {
            return (
              <>
                <code>{file.file.name}</code> (Note: Modern skins are not yet
                visible in the museum)
              </>
            );
          }
          return (
            <a
              href={Utils.museumUrlFromHash(file.md5)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <code>{file.file.name}</code>
            </a>
          );
        }}
      />
    </>
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
      }}
    >
      {isDragActive || Object.keys(files).length === 0 ? (
        <DropTarget getInputProps={getInputProps} />
      ) : (
        <div style={{ padding: 15 }}>
          <Inner files={files} {...props} />
        </div>
      )}
    </div>
  );
}
export default UploadGrid;
