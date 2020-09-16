import React from "react";

function DropTarget({ getInputProps }) {
  return (
    <div
      style={{
        margin: 20,
        flexGrow: 1,
        border: "8px dashed grey",
        borderRadius: 20,
        color: "grey",
        textAlign: "center",
        vericalAlign: "middle",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div style={{ fontSize: 30, color: "white" }}>Drop Skins Here</div>
      <div
        style={{
          paddingTop: 30,
          fontSize: 20,
          paddingLeft: 25,
          paddingRight: 25,
          lineHeight: 1.3,
          maxWidth: 400,
        }}
      >
        We'll analyze them in your browser to find any that are missing from the
        museum
      </div>
      <input {...getInputProps()} />
    </div>
  );
}

export default DropTarget;
