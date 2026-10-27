"use client";

import {
  memo,
  // @ts-expect-error - unstable_ViewTransition is not yet in @types/react
  unstable_ViewTransition as ViewTransition,
} from "react";
import { ClientSkin } from "./gridSkin";
import SkinActionIcons from "./SkinActionIcons";
import SkinReadme from "./SkinReadme";
import SkinScreenshot from "./SkinScreenshot";
import { useShowNsfw } from "./nsfwConsent";
import NsfwCover from "./NsfwCover";
import { MOBILE_MAX_WIDTH } from "../../../legacy-client/src/constants";
import { Check } from "lucide-react";
import type { WebampExit } from "./eventTypes";

type Props = {
  skin: ClientSkin;
  // Whether this is the skin currently scrolled into view.
  focused: boolean;
  // Receives the element the shared Webamp instance is moved into, which only
  // the focused skin renders.
  webampSlotRef: (node: HTMLDivElement | null) => void;
  // Whether the visitor is using Webamp (on a touch screen; see
  // .webamp-shield in scroll.css), and starting and stopping that.
  usingWebamp: boolean;
  onUseWebamp: (md5: string) => void;
  onStopUsingWebamp: (how: WebampExit) => void;
};

// Memoized: the feed keeps every page it has loaded mounted, and only the
// pages gaining or losing focus need to re-render as you scroll.
export default memo(function SkinPage({
  skin,
  focused,
  webampSlotRef,
  usingWebamp,
  onUseWebamp,
  onStopUsingWebamp,
}: Props) {
  // An NSFW skin stays blurred, and Webamp isn't loaded over it, until the
  // visitor chooses to see NSFW skins.
  const showNsfw = useShowNsfw();
  const hidden = skin.nsfw && !showNsfw;
  return (
    <div
      data-skin-md5={skin.md5}
      className={usingWebamp ? "skin-page using-webamp" : "skin-page"}
    >
      <div className="skin-column" style={{ maxWidth: MOBILE_MAX_WIDTH }}>
        <div className="skin-title-row">
          <h2 className="skin-title" title={skin.fileName}>
            {skin.fileName}
          </h2>
        </div>
        {/* The skin, with the action icons positioned beside it. */}
        <div className="skin-frame">
          <div className="skin-stage" style={{ position: "relative" }}>
            <ViewTransition name={`skin-${skin.md5}`}>
              <SkinScreenshot
                md5={skin.md5}
                alt={skin.fileName}
                blurred={hidden}
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
            {focused && !hidden && !usingWebamp && (
              <button
                className="webamp-shield"
                aria-label={`Use Webamp with ${skin.fileName}`}
                onClick={() => onUseWebamp(skin.md5)}
              />
            )}
            {hidden && <NsfwCover skinMd5={skin.md5} />}
          </div>

          <SkinActionIcons skin={skin} />
        </div>

        <SkinReadme skin={skin} focused={focused} />
      </div>
      {usingWebamp && (
        <button
          className="webamp-done"
          onClick={() => onStopUsingWebamp("done")}
        >
          <Check size={18} />
          Done
        </button>
      )}
    </div>
  );
});
