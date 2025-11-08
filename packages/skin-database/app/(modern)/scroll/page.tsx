import UserContext from "../../../data/UserContext";
import SessionModel from "../../../data/SessionModel";
import "./scroll.css";
import SkinScroller, { ClientSkin } from "./SkinScroller";
import { getScrollPage } from "../../../data/skins";
import SkinModel from "../../../data/SkinModel";
import { LayoutWrapper } from "./layout";

// Ensure each page load gets a new session
export const dynamic = "force-dynamic";

async function getClientSkins(sessionId: string): Promise<ClientSkin[]> {
  "use server";
  const ctx = new UserContext();

  const page = await getScrollPage(sessionId);

  const skins = await Promise.all(
    page.map(async (item) => {
      const model = await SkinModel.fromMd5Assert(ctx, item.md5);
      const readmeText = await model.getReadme();
      const fileName = await model.getFileName();
      const tweet = await model.getTweet();
      const likeCount = tweet ? tweet.getLikes() : 0;

      return {
        screenshotUrl: model.getScreenshotUrl(),
        md5: item.md5,
        // TODO: Normalize to .wsz
        fileName: fileName,
        readmeStart: readmeText ? readmeText.slice(0, 200) : "",
        downloadUrl: model.getSkinUrl(),
        shareUrl: `https://skins.webamp.org/skin/${item.md5}`,
        nsfw: await model.getIsNsfw(),
        likeCount: likeCount,
      };
    })
  );
  for (const skin of skins) {
    SessionModel.addSkin(sessionId, skin.md5);
  }
  return skins;
}

/**
 * A tik-tok style scroll page where we display one skin at a time in full screen
 */
export default async function ScrollPage() {
  // Create the session in the database
  const sessionId = await SessionModel.create();

  const initialSkins = await getClientSkins(sessionId);

  return (
    <LayoutWrapper sessionId={sessionId}>
      <SkinScroller
        initialSkins={initialSkins}
        getSkins={getClientSkins}
        sessionId={sessionId}
      />
    </LayoutWrapper>
  );
}
