import * as React from "react";
export function DebugFile({ file }) {
  return (
    <div>
      <h1>{file.filename}</h1>
      <PreviewFile file={file} />
    </div>
  );
}

export function PreviewFile({ file }) {
  if (
    file.filename.toLowerCase().endsWith(".bmp") ||
    file.filename.toLowerCase().endsWith(".png")
  ) {
    return (
      // eslint-disable-next-line jsx-a11y/alt-text
      <img
        src={file.url}
        style={{
          transformOrigin: "top left",
          transform: "scale(2)",
          imageRendering: "pixelated",
        }}
      />
    );
  }
  if (file.filename.toLowerCase().endsWith(".cur")) {
    return (
      <div>
        (Hover in the box to see .cur preview)
        <div
          style={{
            cursor: "url(" + file.url + "), auto",
            border: "2px solid black",
            minWidth: "400px",
            minHeight: "400px",
          }}
        />
      </div>
    );
  }
  if (file.text_content != null) {
    return (
      <pre style={{ whiteSpace: "pre-line", maxWidth: 600 }}>
        {file.text_content}
      </pre>
    );
  }
  return "[[No preview available]]";
}
