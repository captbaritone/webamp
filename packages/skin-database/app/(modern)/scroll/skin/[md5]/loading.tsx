"use client";

// @ts-expect-error - unstable_ViewTransition is not yet in @types/react
import { unstable_ViewTransition as ViewTransition } from "react";
import { useParams } from "next/navigation";
import { MOBILE_MAX_WIDTH } from "../../../../../legacy-client/src/constants";

// Same as getScreenshotUrl in data/skins, which we can't import client-side.
function getScreenshotUrl(md5: string): string {
  return `https://r2.webampskins.org/screenshots/${md5}.png`;
}

/**
 * Shown immediately when navigating to a skin (e.g. from the grid) while the
 * feed loads. All we need for the skin's screenshot is its md5, which is in the
 * URL. Mirrors SkinPage's layout so the real page replaces it in place.
 */
export default function Loading() {
  const { md5 } = useParams<{ md5: string }>();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        paddingTop: "1rem",
        paddingBottom: "var(--bottom-nav-height, 4rem)",
        boxSizing: "border-box",
      }}
    >
      <div
        className="skin-column"
        style={{ width: "100%", maxWidth: MOBILE_MAX_WIDTH, margin: "0 auto" }}
      >
        {/* Holds the title's space so the skin doesn't move when it loads. */}
        <div className="skin-title" aria-hidden>
          &nbsp;
        </div>
        <div className="skin-frame">
          <ViewTransition name={`skin-${md5}`}>
            <img
              src={getScreenshotUrl(md5)}
              alt=""
              style={{
                width: "100%",
                aspectRatio: "275 / 348",
                imageRendering: "pixelated",
                display: "block",
              }}
            />
          </ViewTransition>
        </div>
      </div>
    </div>
  );
}
