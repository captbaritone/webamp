"use client";

// @ts-expect-error - unstable_ViewTransition is not yet in @types/react
import { unstable_ViewTransition as ViewTransition } from "react";
import { ClientSkin } from "./SkinScroller";
import SkinActionIcons from "./SkinActionIcons";
import SkinReadme from "./SkinReadme";
import { MOBILE_MAX_WIDTH } from "../../../legacy-client/src/constants";

type Props = {
  skin: ClientSkin;
  index: number;
  sessionId: string;
  // Only set for the focused skin. The shared Webamp instance is moved into
  // this element.
  webampSlotRef?: (node: HTMLDivElement | null) => void;
};

export default function SkinPage({
  skin,
  index,
  sessionId,
  webampSlotRef,
}: Props) {
  return (
    <div
      data-skin-md5={skin.md5}
      data-skin-index={index}
      className="scroller"
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100dvh",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        position: "relative",
        paddingTop: "1rem",
        // Space for the bottom menu bar. Exactly its height, so the readme
        // ends right on top of it.
        paddingBottom: "var(--bottom-nav-height, 4rem)",
        boxSizing: "border-box",
      }}
    >
      <div
        className="skin-column"
        style={{
          width: "100%",
          maxWidth: MOBILE_MAX_WIDTH,
          margin: "0 auto",
          // The skin, then the readme filling whatever space is left.
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <h2 className="skin-title" title={skin.fileName}>
          {skin.fileName}
        </h2>
        {/* The skin, with the action icons positioned beside it. */}
        <div className="skin-frame">
          <div style={{ position: "relative" }}>
            <ViewTransition name={`skin-${skin.md5}`}>
              <img
                src={skin.screenshotUrl}
                alt={skin.fileName}
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "275 / 348",
                  imageRendering: "pixelated",
                }}
              />
              {webampSlotRef != null && (
                <div
                  ref={webampSlotRef}
                  style={{
                    top: 0,
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                  }}
                />
              )}
            </ViewTransition>
          </div>

          <SkinActionIcons skin={skin} sessionId={sessionId} />
        </div>

        <SkinReadme
          skin={skin}
          sessionId={sessionId}
          focused={webampSlotRef != null}
        />
      </div>
    </div>
  );
}
