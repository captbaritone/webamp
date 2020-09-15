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
    const modernSkins = [];
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
          notSkins.push(file);
          break;
        case "NOT_CLASSIC_SKIN":
          modernSkins.push(file);
          break;
        case "FOUND":
          foundSkins.push(file);
          break;
        default:
      }
    });
    return { missing, notSkins, modernSkins, foundSkins };
  }, [filesArr]);
}

function Plural({ count, single, plural }) {
  return count === 1 ? single : plural;
}

function Inner({ getInputProps, isDragActive, files }) {
  const tryToUploadAllFiles = useActionCreator(Actions.tryToUploadAllFiles);
  const filesArr = Object.values(files);
  const { missing, notSkins, modernSkins, foundSkins } = useBucketed(filesArr);

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
          {missing.map((file) => {
            switch (file.status) {
              case "MISSING":
                return (
                  <tr>
                    <td />
                    <td>
                      <code>{file.file.name}</code>
                    </td>
                  </tr>
                );
              case "UPLOADING":
                return (
                  <tr>
                    <td>🚀 Uploading...</td>
                    <td>
                      <code>{file.file.name}</code>
                    </td>
                  </tr>
                );
              case "UPLOAD_FAILED":
                return (
                  <>
                    <td>❌ Upload Failed</td>
                    <td>
                      <code>{file.file.name}</code>
                    </td>
                  </>
                );
              case "ARCHIVED":
                return (
                  <>
                    <td>✅ Added!</td>
                    <td>
                      <a
                        href={Utils.museumUrlFromHash(file.md5)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <code>{file.file.name}</code>
                      </a>
                    </td>
                  </>
                );
              default:
                console.error(`Unexpected file status: ${file.status}`);
                return null;
            }
          })}
        </tbody>
      </table>
      <Section
        open={false}
        files={missing}
        title={<>New skins ({missing.length.toLocaleString()})</>}
        render={(file) => {
          switch (file.status) {
            case "MISSING":
              return <code>{file.file.name}</code>;
            case "UPLOADING":
              return (
                <>
                  <code>{file.file.name}</code> (🚀 Uploading...)
                </>
              );
            case "UPLOAD_FAILED":
              return (
                <>
                  <code>{file.file.name}</code> (❌ Upload Failed)
                </>
              );
            case "ARCHIVED":
              return (
                <>
                  <a
                    href={Utils.museumUrlFromHash(file.md5)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <code>{file.file.name}</code>
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
        files={notSkins}
        title={
          <>Files that are not skins ({notSkins.length.toLocaleString()})</>
        }
        render={(file) => <code>{file.file.name}</code>}
      />
      <Section
        files={modernSkins}
        title={
          <>
            Modern Skins (we're not accepting these yet) (
            {modernSkins.length.toLocaleString()})
          </>
        }
        render={(file) => <code>{file.file.name}</code>}
      />
      <Section
        files={foundSkins}
        title={
          <>Already in the museum ({foundSkins.length.toLocaleString()})</>
        }
        render={(file) => (
          <a
            href={Utils.museumUrlFromHash(file.md5)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <code>{file.file.name}</code>
          </a>
        )}
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
