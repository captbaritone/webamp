export const SCREENSHOT_WIDTH = 275;
export const SCREENSHOT_HEIGHT = 348;
export const SKIN_RATIO = SCREENSHOT_HEIGHT / SCREENSHOT_WIDTH;
export const ABOUT_PAGE = "ABOUT_PAGE";
export const UPLOAD_PAGE = "UPLOAD_PAGE";
export const REVIEW_PAGE = "REVIEW_PAGE";

/**
 * How skin files (images and skins) are stored:
 * 1. Skins up are uploaded to https://s3.amazonaws.com/webamp-uploaded-skins by users
 * 2. Once processed, the server moves them to https://s3.amazonaws.com/cdn.webampskins.org
 * 3. There is a VPS setup with Varnish which is a proxy in front of https://s3.amazonaws.com/cdn.webampskins.org
 * 4. https://mirror.webampskins.org is the CloudFlare CDN wich points the the VPS proxy
 *
 * When a request hits CloudFlare it first tries to get it from its local cache.
 * If it misses, it goes to the VPS. If the VPS is missing the file, it fetches
 * it from S3.
 *
 * If we ever have trouble with the VPS, we can switch to using
 * https://cdn.webampskins.org which is just CloudFlare in front of AWS
 * directly. It's more expensive, but more reliable.
 *
 */

const R2_CDN = "https://r2.webampskins.org";
// export const CDN = "https://s3.amazonaws.com/webamp-uploaded-skins";
// export const CDN = "https://s3.amazonaws.com/cdn.webampskins.org";
// export const S3_SCREENSHOT_CDN = "https://s3.amazonaws.com/cdn.webampskins.org";
export const SCREENSHOT_CDN = R2_CDN;
export const SKIN_CDN = R2_CDN;
// Uncomment these if something goes wrong
// export const SCREENSHOT_CDN = "https://cdn.webampskins.org";
// export const SKIN_CDN = "https://cdn.webampskins.org";
export const API_URL = "https://api.webampskins.org";
// export const API_URL = "https://dev.webamp.org";
export const HEADING_HEIGHT = 46;
export const CHUNK_SIZE = 300;
export const SENTRY_DSN =
  "https://e8278543caf0486b83d718156177c522@o68382.ingest.sentry.io/5508251";
