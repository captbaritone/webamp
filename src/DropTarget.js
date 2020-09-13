import React from "react";
import { HEADING_HEIGHT } from "./constants";

function DropTarget({ getInputProps }) {
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
        <input {...getInputProps} />
      </div>
    </div>
  );
}
export default DropTarget;
