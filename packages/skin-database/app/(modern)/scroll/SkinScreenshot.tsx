import { screenshotUrlFromHash } from "../../../legacy-client/src/utils";
import { corsScreenshotUrl } from "./skinTint";

type Props = {
  md5: string;
  alt: string;
  // Flagged NSFW and not yet chosen to be seen.
  blurred: boolean;
  // Takes its space without showing anything.
  invisible?: boolean;
};

/**
 * A skin's screenshot in the feed, and on the loading screen before it, which
 * must match so the page replaces it in place.
 */
export default function SkinScreenshot({
  md5,
  alt,
  blurred,
  invisible = false,
}: Props) {
  return (
    <img
      className={blurred ? "skin-screenshot nsfw-blurred" : "skin-screenshot"}
      style={invisible ? { visibility: "hidden" } : undefined}
      // So its colors can be read for the backdrop tint (and the same URL and
      // request mode everywhere, so the browser caches one copy).
      crossOrigin="anonymous"
      src={corsScreenshotUrl(screenshotUrlFromHash(md5))}
      alt={alt}
    />
  );
}
