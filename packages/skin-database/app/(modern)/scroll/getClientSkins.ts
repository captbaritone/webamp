import UserContext from "../../../data/UserContext";
import SessionModel from "../../../data/SessionModel";
import { ClientSkin } from "./SkinScroller";
import { getScrollPage } from "../../../data/skins";
import SkinModel from "../../../data/SkinModel";

// Ensure each page load gets a new session
export const dynamic = "force-dynamic";

export async function getClientSkins(sessionId: string): Promise<ClientSkin[]> {
  "use server";
  const ctx = new UserContext();

  const page = await getScrollPage(sessionId);

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
) {
  const model = await SkinModel.fromMd5Assert(ctx, md5);
  const readmeText = await model.getReadme();
  const fileName = await model.getFileName();
  const tweet = await model.getTweet();
  const likeCount = tweet ? tweet.getLikes() : 0;

  SessionModel.addSkin(sessionId, md5);

  return {
    screenshotUrl: model.getScreenshotUrl(),
    md5,
    // TODO: Normalize to .wsz
    fileName: fileName,
    readmeStart: readmeText ? readmeText.slice(0, 200) : "",
    downloadUrl: model.getSkinUrl(),
    shareUrl: `https://skins.webamp.org/scroll/skin/${md5}`,
    nsfw: await model.getIsNsfw(),
    likeCount: likeCount,
  };
}
