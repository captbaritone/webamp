import path from "path";
import UserContext, { ctxWeakMapMemoize } from "./UserContext";
import { FileRow } from "../types";
import DataLoader from "dataloader";
import { knex } from "../db";

export type FileDebugData = {
  row: FileRow;
};

export default class FileModel {
  constructor(readonly ctx: UserContext, readonly row: FileRow) {}

  static async fromMd5(ctx: UserContext, md5: string): Promise<FileModel[]> {
    const rows = await getFilesLoader(ctx).load(md5);
    return rows.map((row) => new FileModel(ctx, row));
  }

  getFileName(): string {
    return path.basename(this.row.file_path);
  }

  async debug(): Promise<FileDebugData> {
    return {
      row: this.row,
    };
  }
}

const getFilesLoader = ctxWeakMapMemoize<DataLoader<string, FileRow[]>>(
  () =>
    new DataLoader<string, FileRow[]>(async (md5s) => {
      const rows = await knex("files").whereIn("skin_md5", md5s).select();
      return md5s.map((md5) => rows.filter((x) => x.skin_md5 === md5));
    })
);
