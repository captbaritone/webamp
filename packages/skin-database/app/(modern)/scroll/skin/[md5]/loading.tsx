"use client";

// @ts-expect-error - unstable_ViewTransition is not yet in @types/react
import { unstable_ViewTransition as ViewTransition } from "react";
import { useParams } from "next/navigation";
import { MOBILE_MAX_WIDTH } from "../../../../../legacy-client/src/constants";
import { screenshotUrlFromHash } from "../../../../../legacy-client/src/utils";
import BackToGrid from "../../BackToGrid";
import { corsScreenshotUrl } from "../../skinTint";
import { getKnownNsfw, useShowNsfw } from "../../nsfwConsent";

/**
 * Shown immediately when navigating to a skin (e.g. from the grid) while the
 * feed loads. All we need for the skin's screenshot is its md5, which is in the
 * URL. Uses SkinPage's layout classes so the real page replaces it in place.
 */
export default function Loading() {
  const { md5 } = useParams<{ md5: string }>();
  const showNsfw = useShowNsfw();
  // Only show the screenshot if we know it's safe to (e.g. it was opened from
  // the grid). An NSFW one is blurred, as on SkinPage; one we know nothing
  // about waits for the real page rather than risk showing it.
  const nsfw = getKnownNsfw(md5);
  const hidden = nsfw === true && !showNsfw;
  return (
    <div className="skin-page">
      <div className="skin-column" style={{ maxWidth: MOBILE_MAX_WIDTH }}>
        {/* Same row as SkinPage, so the skin doesn't move when it loads. */}
        <div className="skin-title-row">
          <BackToGrid />
          <div className="skin-title" aria-hidden>
            &nbsp;
          </div>
        </div>
        <div className="skin-frame">
          <ViewTransition name={`skin-${md5}`}>
            <img
              className={
                hidden ? "skin-screenshot nsfw-blurred" : "skin-screenshot"
              }
              style={nsfw == null ? { visibility: "hidden" } : undefined}
              // The same URL and request mode as SkinPage's, so it's one
              // cached image.
              crossOrigin="anonymous"
              src={corsScreenshotUrl(screenshotUrlFromHash(md5))}
              alt=""
            />
          </ViewTransition>
        </div>
      </div>
    </div>
  );
}
