// Functions for deriving information from skins

import { knex } from "./db";
import JSZip from "jszip";
import { SkinType } from "./types";
import * as Skins from "./data/skins";
import SkinModel from "./data/SkinModel";

export async function setReadmeForSkin(skin: SkinModel): Promise<void> {
  let text: string | null;
  try {
    text = await getReadme(await skin.getZip());
  } catch (e) {
    console.error(e.message);
    return;
  }

  if (skin.getReadme() !== text) {
    await knex("skins")
      .where({ md5: skin.getMd5() })
      .update({ readme_text: text });
    await Skins.updateSearchIndex(skin.getMd5());
  }
}

const IS_README = /(file_id\.diz)|(\.txt)$/i;
// Skinning Updates.txt ?
const IS_NOT_README = /(genex\.txt)|(genexinfo\.txt)|(gen_gslyrics\.txt)|(region\.txt)|(pledit\.txt)|(viscolor\.txt)|(winampmb\.txt)|("gen_ex help\.txt)|(mbinner\.txt)$/i;

export async function getReadme(zip: JSZip): Promise<string | null> {
  const readmeFiles = zip.filter((filePath) => {
    return IS_README.test(filePath) && !IS_NOT_README.test(filePath);
  });

  if (readmeFiles.length === 0) {
    return null;
  }

  // TODO, could we try to get more than one?
  const readme = readmeFiles[0];

  return readme.async("text");
}

export async function getSkinType(zip: JSZip): Promise<SkinType> {
  if (zip.file(/main\.bmp$/i).length > 0) {
    return "CLASSIC";
  }
  if (zip.file(/skin\.xml$/i).length > 0) {
    return "MODERN";
  }
  throw new Error("Not a skin");
}
