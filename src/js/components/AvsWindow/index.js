import React from "react";
import GenWindow from "../GenWindow";
import "../../../css/gen-window.css";

const AvsWindow = () => (
  <GenWindow title="Avs" close={() => {}} windowId="AVS_WINDOW">
    <canvas
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        height: "100%",
        width: "100%"
      }}
    />
  </GenWindow>
);

export default AvsWindow;
