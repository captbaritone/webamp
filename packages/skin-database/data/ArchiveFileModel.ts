import UserContext, { ctxWeakMapMemoize } from "./UserContext";
import { ArchiveFileRow } from "../types";
import DataLoader from "dataloader";
import { knex } from "../db";
import SkinModel from "./SkinModel";

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

  getMd5(): string {
    return this.row.skin_md5;
  }

  getFileName(): string {
    return this.row.file_name;
  }

  getFileDate(): Date {
    return new Date(this.row.file_date);
  }

  getUrl(): string {
    const filename = encodeURIComponent(this.getFileName());
    return `https://zip-worker.jordan1320.workers.dev/zip/${this.getMd5()}/${filename}`;
  }

  async getSkin(): Promise<SkinModel> {
    return SkinModel.fromMd5Assert(this.ctx, this.getMd5());
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
