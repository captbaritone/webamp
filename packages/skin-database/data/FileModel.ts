import path from "path";
import UserContext from "./UserContext";
import { FileRow } from "../types";

export type FileDebugData = {
  row: FileRow;
};

export default class FileModel {
  constructor(readonly ctx: UserContext, readonly row: FileRow) {}

  static async fromMd5(ctx: UserContext, md5: string): Promise<FileModel[]> {
    const rows = await ctx.files.load(md5);
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
