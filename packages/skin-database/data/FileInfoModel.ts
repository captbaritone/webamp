import UserContext, { ctxWeakMapMemoize } from "./UserContext";
import { FileInfoRow } from "../types";
import DataLoader from "dataloader";
import { knex } from "../db";

export type FileInfoDebugData = {
  row: FileInfoRow;
};

export default class FileInfoModel {
  constructor(readonly ctx: UserContext, readonly row: FileInfoRow) { }

  static async fromFileMd5(
    ctx: UserContext,
    md5: string
  ): Promise<FileInfoModel | null> {
    const row = await getFileInfoByFileMd5Loader(ctx).load(md5);
    return row == null ? null : new FileInfoModel(ctx, row);
  }

  getFileMd5(): string {
    return this.row.file_md5;
  }

  getFileSize(): number | null {
    return this.row.size_in_bytes;
  }

  getTextContent(): string | null {
    console.log("row", this.row)
    return this.row.text_content;
  }

  async debug(): Promise<FileInfoDebugData> {
    return {
      row: this.row,
    };
  }
}

const getFileInfoByFileMd5Loader = ctxWeakMapMemoize<
  DataLoader<string, FileInfoRow>
>(
  () =>
    new DataLoader<string, FileInfoRow>(async (md5s) => {
      const rows = await knex("file_info").whereIn("file_md5", md5s).select();
      return md5s.map((md5) => rows.find((x) => x.file_md5 === md5));
    })
);
