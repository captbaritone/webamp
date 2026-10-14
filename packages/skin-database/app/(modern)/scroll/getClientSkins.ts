import UserContext from "../../../data/UserContext";
import SessionModel from "../../../data/SessionModel";
import { ClientSkin } from "./SkinScroller";
import { getScrollPage } from "../../../data/skins";
import SkinModel from "../../../data/SkinModel";

// The feed shows the whole readme (clipped until expanded), so we send it all,
// within reason. A handful of readmes are enormous.
const README_MAX_LENGTH = 5000;

// Fetches the next page of the feed as the user scrolls.
export async function getClientSkins(sessionId: string): Promise<ClientSkin[]> {
  "use server";
  return getClientSkinsPage(sessionId);
}

// The first page is rendered with the route, so we keep it small: everything
// in it has to download before the feed appears. The scroller fetches full
// pages from there.
export const INITIAL_PAGE_SIZE = 10;

export async function getClientSkinsPage(
  sessionId: string,
  pageSize?: number
): Promise<ClientSkin[]> {
  const ctx = new UserContext();

  const page = await getScrollPage(sessionId, pageSize);

  return await Promise.all(
    page.map(async (item) => {
      return getSkinForSession(ctx, sessionId, item.md5);
    })
  );
}

export async function getSkinForSession(
  ctx: UserContext,
  sessionId: string,
  md5: string
): Promise<ClientSkin> {
  const model = await SkinModel.fromMd5Assert(ctx, md5);
  const readmeText = (await model.getReadme())?.trim() ?? "";
  const fileName = await model.getFileName();
  const tweet = await model.getTweet();
  const likeCount = tweet ? tweet.getLikes() : 0;

  // Await this so that a later getScrollPage for this session excludes it.
  await SessionModel.addSkin(sessionId, md5);

  return {
    screenshotUrl: model.getScreenshotUrl(),
    skinUrl: model.getSkinUrl(),
    md5,
    // TODO: Normalize to .wsz
    fileName: fileName,
    readme:
      readmeText.length > README_MAX_LENGTH
        ? `${readmeText.slice(0, README_MAX_LENGTH)}…`
        : readmeText,
    downloadUrl: model.getSkinUrl(),
    shareUrl: `https://skins.webamp.org/scroll/skin/${md5}`,
    nsfw: await model.getIsNsfw(),
    likeCount: likeCount,
  };
}
