import JSZip from "jszip";
import md5 from "md5";
import { knex } from "./db";
import SkinModel from "./data/SkinModel";

type FileData = {
  fileName: string;
  md5: string;
  date: Date;
  textContent: string | null;
  uncompressedSize: number;
  isDirectory: boolean;
};

function mightBeText(filename: string): boolean {
  if (/skin\.xml/i.test(filename)) {
    return true;
  }
  return !/\.(bmp|pdf|png|zip|wsz|cur|ani|jpg|jpeg|db|gif|avs|psd|psp|ico|ttf|milk|bak|maki|m|doc|tmp|_bm|ai|log|uue|xml)$/i.test(
    filename
  );
}

async function getFileData(file: JSZip.JSZipObject): Promise<FileData | null> {
  try {
    let textContent: string | null = null;
    const extractText = mightBeText(file.name);
    if (extractText) {
      textContent = await file.async("text");
    }
    const blob = await file.async("nodebuffer");
    return {
      fileName: file.name,
      md5: md5(blob),
      date: file.date,
      textContent,
      // @ts-ignore Private property, YOLO
      uncompressedSize: file._data.uncompressedSize,
      isDirectory: file.dir,
    };
  } catch (_e) {
    // TODO: We could flag these.
    return null;
  }
}

export async function getSkinFileData(
  skin: SkinModel
): Promise<(FileData | null)[]> {
  const zip = await skin.getZip();
  return Promise.all(Object.values(zip.files).map(getFileData));
}

// https://stackoverflow.com/a/46700791/1263117
function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export async function setHashesForSkin(skin: SkinModel): Promise<void> {
  const hashes = await getSkinFileData(skin);
  const rows = hashes
    .filter(notEmpty)
    .map(
      ({ fileName, md5, date, isDirectory, textContent, uncompressedSize }) => {
        return {
          skin_md5: skin.getMd5(),
          file_name: fileName,
          file_md5: md5, // TODO: Consider using an id into file_info table
          file_date: date,
          text_content: textContent,
          uncompressed_size: uncompressedSize,
          is_directory: isDirectory,
        };
      }
    );
  await knex("archive_files").where("skin_md5", skin.getMd5()).delete();
  // Avoid bulk insert because size can be large
  for (const row of rows) {
    await knex("archive_files").insert(row);
  }

  const fileInfoRows = hashes
    .filter(notEmpty)
    .filter(({ isDirectory }) => !isDirectory)
    .map(({ md5, uncompressedSize, textContent }) => {
      return {
        file_md5: md5,
        text_content: textContent,
        size_in_bytes: uncompressedSize,
      };
    });

  for (const row of fileInfoRows) {
    const countRows = await knex("file_info")
      .where({ file_md5: row.file_md5 })
      .count({ count: "*" });
    if (!countRows[0].count) {
      await knex("file_info").insert(row);
    }
  }
}
