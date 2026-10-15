import UserContext from "../../../data/UserContext";
import SessionModel from "../../../data/SessionModel";
import { ClientSkin } from "./SkinScroller";
import { getScrollPage } from "../../../data/skins";
import SkinModel from "../../../data/SkinModel";
import type { SkinSource } from "./eventTypes";
import { skinPath } from "./paths";

// The feed shows the whole readme (clipped until expanded), so we send it all,
// within reason. A handful of readmes are enormous.
const README_MAX_LENGTH = 5000;

// Fetches the next page of the feed as the user scrolls. Only a real browser
// calls this, so it records the page in the session (one insert) so that a
// later getScrollPage for this session excludes them.
export async function getClientSkins(sessionId: string): Promise<ClientSkin[]> {
  "use server";
  const page = await getScrollPage(sessionId);
  const [skins] = await Promise.all([
    getClientSkinsFor(page),
    SessionModel.addSkins(
      sessionId,
      page.map((item) => item.md5)
    ),
  ]);
  return skins;
}

// The first page is rendered with the route, so we keep it small: everything
// in it has to download before the feed appears. The scroller fetches full
// pages from there.
export const INITIAL_PAGE_SIZE = 10;

// The page a feed is rendered with. Not recorded in the session here: renders
// also come from crawlers and link previews, so the browser reports these
// skins in its session_start event instead (see SessionModel).
export async function getInitialClientSkins(
  sessionId: string,
  linkedMd5?: string
): Promise<ClientSkin[]> {
  const page = (await getScrollPage(sessionId, INITIAL_PAGE_SIZE)).filter(
    (item) => item.md5 !== linkedMd5
  );
  return getClientSkinsFor(
    linkedMd5 == null ? page : [{ md5: linkedMd5, source: "link" }, ...page]
  );
}

function getClientSkinsFor(
  page: Array<{ md5: string; source: SkinSource }>
): Promise<ClientSkin[]> {
  const ctx = new UserContext();
  return Promise.all(
    page.map(({ md5, source }) => getClientSkin(ctx, md5, source))
  );
}

async function getClientSkin(
  ctx: UserContext,
  md5: string,
  source: SkinSource
): Promise<ClientSkin> {
  const model = await SkinModel.fromMd5Assert(ctx, md5);
  const [readme, fileName, tweet, nsfw] = await Promise.all([
    model.getReadme(),
    model.getFileName(true),
    model.getTweet(),
    model.getIsNsfw(),
  ]);
  const readmeText = readme?.trim() ?? "";

  return {
    screenshotUrl: model.getScreenshotUrl(),
    skinUrl: model.getSkinUrl(),
    md5,
    source,
    fileName,
    readme:
      readmeText.length > README_MAX_LENGTH
        ? `${readmeText.slice(0, README_MAX_LENGTH)}…`
        : readmeText,
    downloadUrl: model.getSkinUrl(),
    shareUrl: `https://skins.webamp.org${skinPath(md5, fileName)}`,
    nsfw,
    likeCount: tweet ? tweet.getLikes() : 0,
  };
}
