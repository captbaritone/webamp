"use client";

import { ClientSkin } from "./SkinScroller";
import SkinActionIcons from "./SkinActionIcons";

type Props = {
  skin: ClientSkin;
  index: number;
  sessionId: string;
};

export default function SkinPage({ skin, index, sessionId }: Props) {
  return (
    <div
      key={skin.md5}
      skin-md5={skin.md5}
      skin-index={index}
      className="scroller"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        height: "100vh",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        position: "relative",
        paddingTop: "2rem", // Space for top shadow
        paddingBottom: "5rem", // Space for bottom menu bar
        boxSizing: "border-box",
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img
          src={skin.screenshotUrl}
          alt={skin.fileName}
          style={{
            width: "100%",
            imageRendering: "pixelated",
          }}
        />

        <SkinActionIcons skin={skin} sessionId={sessionId} />
      </div>

      <div
        style={{
          color: "white",
          paddingLeft: "0.5rem",
          paddingTop: "0.5rem",
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            marginBottom: 0,
            fontSize: "0.9rem",
            paddingBottom: "0",
            fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
            color: "#ccc",
            wordBreak: "break-all",
          }}
        >
          {skin.fileName}
        </h2>
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.75rem",
            paddingTop: "0",
            color: "#999",
            fontFamily: 'monospace, "Courier New", Courier, monospace',
            overflow: "hidden",
          }}
        >
          {skin.readmeStart}
        </p>
      </div>
    </div>
  );
}
