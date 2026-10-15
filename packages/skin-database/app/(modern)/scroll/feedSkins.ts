import UserContext from "../../../data/UserContext";
import SkinModel from "../../../data/SkinModel";
import { GridSkin, SkinDetails, toGridSkin } from "./gridSkin";

// Server-only: what the feed shows of a skin.

// The feed shows the whole readme (clipped until expanded), so we send it all,
// within reason. A handful of readmes are enormous.
const README_MAX_LENGTH = 5000;

/** The skin a feed page is for, or null if there's no such classic skin. */
export async function getLinkedSkin(
  md5: string
): Promise<{ skin: GridSkin; details: SkinDetails } | null> {
  const model = await SkinModel.fromMd5(new UserContext(), md5);
  if (model == null || model.getSkinType() !== "CLASSIC") return null;
  const [fileName, nsfw, details] = await Promise.all([
    model.getFileName(true),
    model.getIsNsfw(),
    getDetails(model),
  ]);
  return { skin: toGridSkin(md5, fileName, nsfw), details };
}

/** Whether there's a classic skin with this md5 (cheaper than getLinkedSkin). */
export async function isLinkableSkin(md5: string): Promise<boolean> {
  const model = await SkinModel.fromMd5(new UserContext(), md5);
  return model != null && model.getSkinType() === "CLASSIC";
}

export async function getSkinDetailsFor(
  md5s: string[]
): Promise<Record<string, SkinDetails>> {
  const ctx = new UserContext();
  const entries = await Promise.all(
    md5s.map(async (md5) => {
      const model = await SkinModel.fromMd5(ctx, md5);
      return model == null ? null : ([md5, await getDetails(model)] as const);
    })
  );
  return Object.fromEntries(entries.filter((entry) => entry != null));
}

async function getDetails(model: SkinModel): Promise<SkinDetails> {
  const [readme, tweet] = await Promise.all([
    model.getReadme(),
    model.getTweet(),
  ]);
  const readmeText = readme?.trim() ?? "";
  return {
    readme:
      readmeText.length > README_MAX_LENGTH
        ? `${readmeText.slice(0, README_MAX_LENGTH)}…`
        : readmeText,
    likeCount: tweet ? tweet.getLikes() : 0,
  };
}
