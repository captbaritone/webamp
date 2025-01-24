import UserContext, { ctxWeakMapMemoize } from "./UserContext";
import { ArchiveFileRow } from "../types";
import DataLoader from "dataloader";
import { knex } from "../db";
import SkinModel from "./SkinModel";
import FileInfoModel from "./FileInfoModel";
import { ISkin } from "../api/graphql/resolvers/CommonSkinResolver";
import SkinResolver from "../api/graphql/resolvers/SkinResolver";
import { Int } from "grats";
import { Ctx } from "../api/graphql";

export type ArchiveFileDebugData = {
  row: ArchiveFileRow;
};

/**
 * A file found within a Winamp Skin's .wsz archive
 * @gqlType ArchiveFile
 */
export default class ArchiveFileModel {
  constructor(readonly ctx: UserContext, readonly row: ArchiveFileRow) {}

  static async fromMd5(
    ctx: UserContext,
    md5: string
  ): Promise<ArchiveFileModel[]> {
    const rows = await getArchiveFilesLoader(ctx).load(md5);
    return rows.map((row) => new ArchiveFileModel(ctx, row));
  }

  static async fromFileMd5(
    ctx: UserContext,
    md5: string
  ): Promise<ArchiveFileModel | null> {
    const row = await getArchiveFilesByFileMd5Loader(ctx).load(md5);
    return row == null ? null : new ArchiveFileModel(ctx, row);
  }

  /**
   * Md5 of the _skin_
   *
   * **Note:** This is not the md5 of the file itself. Consider renaming this to
   * `getSkinMd5`
   */
  getMd5(): string {
    return this.row.skin_md5;
  }

  /**
   * The md5 hash of the file within the archive
   * @gqlField file_md5
   */
  getFileMd5(): string {
    return this.row.file_md5;
  }

  /**
   * Filename of the file within the archive
   * @gqlField filename
   */
  getFileName(): string {
    return this.row.file_name;
  }

  getFileDate(): Date {
    return new Date(this.row.file_date);
  }

  /**
   * The date on the file inside the archive. Given in simplified extended ISO
   * format (ISO 8601).
   * @gqlField date
   */
  getIsoDate(): string {
    return this.getFileDate().toISOString();
  }

  /**
   * The uncompressed size of the file in bytes.
   *
   * **Note:** Will be `null` for directories
   * @gqlField size
   */
  async getFileSize(): Promise<Int | null> {
    const info = await this._getFileInfo();
    if (info == null) {
      return null;
    }
    return info.getFileSize();
  }

  /**
   * The content of the file, if it's a text file
   * @gqlField text_content
   */
  async getTextContent(): Promise<string | null> {
    const info = await this._getFileInfo();
    if (info == null) {
      return null;
    }
    return info.getTextContent();
  }

  /**
   * Is the file a directory?
   * @gqlField is_directory
   */
  getIsDirectory(): boolean {
    return Boolean(this.row.is_directory);
  }

  /**
   * A URL to download the file. **Note:** This is powered by a little
   * serverless Cloudflare function which tries to exctact the file on the fly.
   * It may not work for all files.
   * @gqlField url
   */
  getUrl(): string {
    const filename = encodeURIComponent(this.getFileName());
    return `https://zip-worker.jordan1320.workers.dev/zip/${this.getMd5()}/${filename}`;
  }

  async getSkin(): Promise<SkinModel> {
    return SkinModel.fromMd5Assert(this.ctx, this.getMd5());
  }

  /**
   * The skin in which this file was found
   * @gqlField skin
   */
  async skin(): Promise<ISkin | null> {
    const model = await SkinModel.fromMd5Assert(this.ctx, this.getMd5());
    return SkinResolver.fromModel(model);
  }

  // Let's try to keep this as an implementation detail
  async _getFileInfo(): Promise<FileInfoModel | null> {
    return FileInfoModel.fromFileMd5(this.ctx, this.getFileMd5());
  }

  async debug(): Promise<ArchiveFileDebugData> {
    return {
      row: this.row,
    };
  }
}

/**
 * Fetch archive file by it's MD5 hash
 *
 * Get information about a file found within a skin's wsz/wal/zip archive.
 * @gqlQueryField
 */
export async function fetch_archive_file_by_md5(
  md5: string,
  ctx: UserContext
): Promise<ArchiveFileModel | null> {
  return ArchiveFileModel.fromFileMd5(ctx, md5);
}

const getArchiveFilesLoader = ctxWeakMapMemoize<
  DataLoader<string, ArchiveFileRow[]>
>(
  () =>
    new DataLoader<string, ArchiveFileRow[]>(async (md5s) => {
      const rows = await knex("archive_files")
        .whereIn("skin_md5", md5s)
        .select();
      return md5s.map((md5) => rows.filter((x) => x.skin_md5 === md5));
    })
);

const getArchiveFilesByFileMd5Loader = ctxWeakMapMemoize<
  DataLoader<string, ArchiveFileRow>
>(
  () =>
    new DataLoader<string, ArchiveFileRow>(async (md5s) => {
      const rows = await knex("archive_files")
        .whereIn("file_md5", md5s)
        .select();
      return md5s.map((md5) => rows.find((x) => x.file_md5 === md5));
    })
);
