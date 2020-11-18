// Functions for deriving information from skins

import { knex } from "./db";
import JSZip from "jszip";
import { SkinType } from "./types";
import * as Skins from "./data/skins";
import fetch from "node-fetch";

export async function setReadmeForSkin(skinMd5: string): Promise<void> {
  const url = Skins.getSkinUrl(skinMd5);
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Could not fetch skin at "${url}"`);
    return;
  }
  const body = await response.buffer();
  let text: string | null;
  try {
    text = await getReadme(body);
  } catch (e) {
    console.error(e.message);
    return;
  }
  await knex("skins").where({ md5: skinMd5 }).update({ readme_text: text });
  await Skins.updateSearchIndex(skinMd5);
}

const IS_README = /(file_id\.diz)|(\.txt)$/i;
// Skinning Updates.txt ?
const IS_NOT_README = /(genex\.txt)|(genexinfo\.txt)|(gen_gslyrics\.txt)|(region\.txt)|(pledit\.txt)|(viscolor\.txt)|(winampmb\.txt)|("gen_ex help\.txt)|(mbinner\.txt)$/i;

export async function getReadme(buffer: Buffer): Promise<string | null> {
  const zip = await JSZip.loadAsync(buffer);
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

export async function getSkinType(buffer: Buffer): Promise<SkinType> {
  const zip = await JSZip.loadAsync(buffer);
  if (zip.file(/main\.bmp$/i).length > 0) {
    return "CLASSIC";
  }
  if (zip.file(/skin\.xml$/i).length > 0) {
    return "MODERN";
  }
  throw new Error("Not a skin");
}
