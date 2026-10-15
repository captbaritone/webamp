"use client";

import { EyeOff } from "lucide-react";
import { useEventLogger } from "./eventLogger";
import { revealNsfw } from "./nsfwConsent";

type Props = {
  skinMd5: string;
};

/** Covers a blurred NSFW skin in the feed, with the choice to show it. */
export default function NsfwCover({ skinMd5 }: Props) {
  const logger = useEventLogger();
  return (
    <div className="nsfw-cover">
      <EyeOff size={28} aria-hidden />
      <p className="nsfw-cover-title">Flagged as NSFW</p>
      <p className="nsfw-cover-text">
        This skin may contain nudity or other content that&rsquo;s not safe for
        work.
      </p>
      <button
        className="nsfw-cover-button"
        onClick={() => {
          logger.log({ type: "nsfw_reveal", skinMd5 });
          revealNsfw();
        }}
      >
        Show NSFW skins
      </button>
      <p className="nsfw-cover-note">Until you close this tab</p>
    </div>
  );
}
