import UserContext from "../data/UserContext";
import SkinModel from "../data/SkinModel";
import { knex } from "../db";
import { setHashesForSkin } from "../skinHash";
import * as Analyser from "../analyser";
import Shooter from "../shooter";
import { screenshot } from "./screenshotSkin";
import * as Skins from "../data/skins";

// TODO Move this into the function so that we clean up on each run?

async function getExtractionError(skin: SkinModel): Promise<string | null> {
  try {
    await skin.getZip();
  } catch (e) {
    return e.message;
  }

  return null;
}

// A task to download a skin and refresh all the data we scrape from it

export async function getSkinsToRefresh(
  ctx: UserContext,
  n: number,
  neverDone = false
): Promise<SkinModel[]> {
  let query = knex("skins")
    .leftJoin("refreshes", "skins.md5", "refreshes.skin_md5")
    .where("skin_type", 1)
    .orderBy("refreshes.timestamp", "asc")
    .limit(n);

  if (neverDone) {
    query = query.where("refreshes.skin_md5", null);
  }
  const skins = await query.select();

  return skins.map((row) => new SkinModel(ctx, row));
}

export async function refreshSkins(skins: SkinModel[]): Promise<void> {
  const shooterLogger = () => {
    // Don't log
  };
  await Shooter.withShooter(async (shooter: Shooter) => {
    for (const [i, skin] of skins.entries()) {
      await refresh(skin, shooter);
      // We end up caching a lot of stuff (the whole skin/zip) on the model, so we can't just leave these around for the whole process.
      delete skins[i];
    }
  }, shooterLogger);
}

export async function _refresh(
  skin: SkinModel,
  shooter: Shooter
): Promise<void> {
  const extractionError = await getExtractionError(skin);
  if (extractionError != null) {
    throw new Error(extractionError);
  }
  await setHashesForSkin(skin);
  await Skins.setContentHash(skin.getMd5());

  await Analyser.setReadmeForSkin(skin);

  let skinType;
  try {
    skinType = await Analyser.getSkinType(await skin.getZip());
  } catch (e) {
    throw new Error("Not a skin (no main.bmp/skin.xml)");
  }
  if (skinType !== "CLASSIC") {
    // TODO:
    // Reviews are invalid
    // Delete from algolia
    // Delete screenshot
    // Tweets are invalid
    throw new Error("Skin type mismatch");
  }

  // Retake screenshot
  await screenshot(skin, shooter);

  await knex("refreshes").insert({
    skin_md5: skin.getMd5(),
  });
}

export async function refresh(
  skin: SkinModel,
  shooter: Shooter
): Promise<void> {
  if (skin.getSkinType() !== "CLASSIC") {
    throw new Error("Can't refresh non-classic skins");
  }
  try {
    await _refresh(skin, shooter);
  } catch (e) {
    await knex("refreshes").insert({
      skin_md5: skin.getMd5(),
      error: e.message,
    });
    return;
  }
  await knex("refreshes").insert({
    skin_md5: skin.getMd5(),
  });
}
