"use client";

import {
  memo,
  // @ts-expect-error - unstable_ViewTransition is not yet in @types/react
  unstable_ViewTransition as ViewTransition,
} from "react";
import { ClientSkin } from "./SkinScroller";
import SkinActionIcons from "./SkinActionIcons";
import SkinReadme from "./SkinReadme";
import BackToGrid from "./BackToGrid";
import { corsScreenshotUrl } from "./skinTint";
import { useShowNsfw } from "./nsfwConsent";
import NsfwCover from "./NsfwCover";
import { MOBILE_MAX_WIDTH } from "../../../legacy-client/src/constants";

type Props = {
  skin: ClientSkin;
  index: number;
  // Whether this is the skin currently scrolled into view.
  focused: boolean;
  // Receives the element the shared Webamp instance is moved into, which only
  // the focused skin renders.
  webampSlotRef: (node: HTMLDivElement | null) => void;
};

// Memoized: the feed keeps every page it has loaded mounted, and only the
// pages gaining or losing focus need to re-render as you scroll.
export default memo(function SkinPage({
  skin,
  index,
  focused,
  webampSlotRef,
}: Props) {
  // An NSFW skin stays blurred, and Webamp isn't loaded over it, until the
  // visitor chooses to see NSFW skins.
  const showNsfw = useShowNsfw();
  const hidden = skin.nsfw && !showNsfw;
  return (
    <div data-skin-index={index} className="scroller skin-page">
      <div className="skin-column" style={{ maxWidth: MOBILE_MAX_WIDTH }}>
        <div className="skin-title-row">
          <BackToGrid />
          <h2 className="skin-title" title={skin.fileName}>
            {skin.fileName}
          </h2>
        </div>
        {/* The skin, with the action icons positioned beside it. */}
        <div className="skin-frame">
          <div style={{ position: "relative" }}>
            <ViewTransition name={`skin-${skin.md5}`}>
              <img
                className={
                  hidden ? "skin-screenshot nsfw-blurred" : "skin-screenshot"
                }
                // So its colors can be read for the backdrop tint.
                crossOrigin="anonymous"
                src={corsScreenshotUrl(skin.screenshotUrl)}
                alt={skin.fileName}
              />
              {focused && !hidden && (
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
            {hidden && <NsfwCover skinMd5={skin.md5} />}
          </div>

          <SkinActionIcons skin={skin} />
        </div>

        <SkinReadme skin={skin} focused={focused} />
      </div>
    </div>
  );
});
