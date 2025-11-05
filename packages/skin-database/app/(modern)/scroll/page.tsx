import ClassicSkinResolver from "../../../api/graphql/resolvers/ClassicSkinResolver";
import SkinsConnection from "../../../api/graphql/SkinsConnection";
import UserContext from "../../../data/UserContext";
import "./scroll.css";
import SkinScroller, { ClientSkin } from "./SkinScroller";

async function getClientSkins(offset: number): Promise<ClientSkin[]> {
  "use server";
  const ctx = new UserContext();
  const connection = new SkinsConnection(10, offset, "MUSEUM", null);
  const skins = await connection.nodes(ctx);
  if (skins == null) {
    return [];
  }
  const classicSkins = skins.filter(
    (skin): skin is ClassicSkinResolver => skin instanceof ClassicSkinResolver
  );
  const clientSkins: ClientSkin[] = await Promise.all(
    classicSkins.map(async (skin) => {
      const url = await skin.screenshot_url();
      const readmeText = await skin.readme_text();
      return {
        screenshotUrl: url,
        md5: skin.md5(),
        fileName: await skin.filename(true),
        readmeStart: readmeText ? readmeText.slice(0, 200) : "",
      };
    })
  );
  return clientSkins;
}

/**
 * A tik-tok style scroll page where we display one skin at a time in full screen
 */
export default async function ScrollPage() {
  const initialSkins = await getClientSkins(0);

  return <SkinScroller initialSkins={initialSkins} getSkins={getClientSkins} />;
}
