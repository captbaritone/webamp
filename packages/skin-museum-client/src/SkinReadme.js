import React from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";

function SkinReadme() {
  const focusedFile = useSelector((state) => state.focusedSkinFile);
  if (focusedFile == null) {
    return null;
  }

  const { content } = focusedFile;
  if (content == null) {
    return null;
  }
  return createPortal(
    <div
      style={{
        position: "fixed",
        display: "flex",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 1002,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          maxWidth: 400,
          height: "60%",
          backgroundColor: "white",
          padding: 30,
        }}
      >
        <div className={"readme"} style={{ overflow: "scroll" }}>
          <pre>{content}</pre>
        </div>
      </div>
    </div>,

    window.document.body
  );
}

export default SkinReadme;
