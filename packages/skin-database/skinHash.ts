import JSZip from "jszip";
import md5 from "md5";
import { knex } from "./db";
import * as Skins from "./data/skins";
import fetch from "node-fetch";

type FileData = {
  fileName: string;
  md5: string;
  date: Date;
};

async function getFileData(file: JSZip.JSZipObject): Promise<FileData> {
  const blob = await file.async("nodebuffer");
  return { fileName: file.name, md5: md5(blob), date: file.date };
}

export async function getSkinFileData(skinData: Buffer): Promise<FileData[]> {
  const zip = await JSZip.loadAsync(skinData);
  return Promise.all(Object.values(zip.files).map(getFileData));
}

export async function setHashesForSkin(skinMd5: string): Promise<void> {
  const url = Skins.getSkinUrl(skinMd5);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not fetch skin at "${url}"`);
  }
  const body = await response.buffer();
  const hashes = await getSkinFileData(body);
  const rows = hashes.map(({ fileName, md5, date }) => {
    return {
      skin_md5: skinMd5,
      file_name: fileName,
      file_md5: md5,
      file_date: date,
    };
  });
  await knex("archive_files").where("skin_md5", skinMd5).delete();
  await knex("archive_files").insert(rows);
}
