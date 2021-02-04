import JSZip from "jszip";
import md5 from "md5";
import { knex } from "./db";
import SkinModel from "./data/SkinModel";

type FileData = {
  fileName: string;
  md5: string;
  date: Date;
};

async function getFileData(file: JSZip.JSZipObject): Promise<FileData | null> {
  try {
    const blob = await file.async("nodebuffer");
    return { fileName: file.name, md5: md5(blob), date: file.date };
  } catch (e) {
    // TODO: We could flag these.
    return null;
  }
}

export async function getSkinFileData(
  skin: SkinModel
): Promise<(FileData | null)[]> {
  const zip = await skin.getZip();
  return await Promise.all(Object.values(zip.files).map(getFileData));
}

// https://stackoverflow.com/a/46700791/1263117
function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export async function setHashesForSkin(skin: SkinModel): Promise<void> {
  const hashes = await getSkinFileData(skin);
  const rows = hashes.filter(notEmpty).map(({ fileName, md5, date }) => {
    return {
      skin_md5: skin.getMd5(),
      file_name: fileName,
      file_md5: md5,
      file_date: date,
    };
  });
  await knex("archive_files").where("skin_md5", skin.getMd5()).delete();
  await knex("archive_files").insert(rows);
}
