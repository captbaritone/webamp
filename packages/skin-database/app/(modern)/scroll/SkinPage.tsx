"use client";

import {
  memo,
  // @ts-expect-error - unstable_ViewTransition is not yet in @types/react
  unstable_ViewTransition as ViewTransition,
} from "react";
import { ClientSkin } from "./SkinScroller";
import SkinActionIcons from "./SkinActionIcons";
import SkinReadme from "./SkinReadme";
import { MOBILE_MAX_WIDTH } from "../../../legacy-client/src/constants";

type Props = {
  skin: ClientSkin;
  index: number;
  sessionId: string;
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
  sessionId,
  focused,
  webampSlotRef,
}: Props) {
  return (
    <div data-skin-index={index} className="scroller skin-page">
      <div className="skin-column" style={{ maxWidth: MOBILE_MAX_WIDTH }}>
        <h2 className="skin-title" title={skin.fileName}>
          {skin.fileName}
        </h2>
        {/* The skin, with the action icons positioned beside it. */}
        <div className="skin-frame">
          <div style={{ position: "relative" }}>
            <ViewTransition name={`skin-${skin.md5}`}>
              <img
                className="skin-screenshot"
                src={skin.screenshotUrl}
                alt={skin.fileName}
              />
              {focused && (
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

        <SkinReadme skin={skin} sessionId={sessionId} focused={focused} />
      </div>
    </div>
  );
});
