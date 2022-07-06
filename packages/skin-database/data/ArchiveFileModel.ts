import UserContext, { ctxWeakMapMemoize } from "./UserContext";
import { ArchiveFileRow } from "../types";
import DataLoader from "dataloader";
import { knex } from "../db";
import SkinModel from "./SkinModel";
import FileInfoModel from "./FileInfoModel";

export type ArchiveFileDebugData = {
  row: ArchiveFileRow;
};

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

  getFileMd5(): string {
    return this.row.file_md5;
  }

  getFileName(): string {
    return this.row.file_name;
  }

  getFileDate(): Date {
    return new Date(this.row.file_date);
  }

  // Null if directory
  async getFileSize(): Promise<number | null> {
    const info = await this._getFileInfo();
    if (info == null) {
      return null;
    }
    return info.getFileSize();
  }

  async getTextContent(): Promise<string | null> {
    const info = await this._getFileInfo();
    if (info == null) {
      return null;
    }
    console.log("info", info)
    return info.getTextContent();
  }

  getIsDirectory(): boolean {
    return Boolean(this.row.is_directory);
  }

  getUrl(): string {
    const filename = encodeURIComponent(this.getFileName());
    return `https://zip-worker.jordan1320.workers.dev/zip/${this.getMd5()}/${filename}`;
  }

  async getSkin(): Promise<SkinModel> {
    return SkinModel.fromMd5Assert(this.ctx, this.getMd5());
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
