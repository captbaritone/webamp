import React from "react";
import UploadRow from "./UploadRow";

function UploadSection({ files, title, extra }) {
  if (files.length === 0) {
    return null;
  }
  return (
    <div
      style={{
        paddingBottom: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>
          {title} ({files.length.toLocaleString()})
        </h2>
        <div>{extra}</div>
      </div>
      {files.map((file) => (
        <UploadRow key={file.id} file={file} />
      ))}
    </div>
  );
}

export default UploadSection;
