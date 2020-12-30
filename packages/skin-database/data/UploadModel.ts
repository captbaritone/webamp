import UserContext, { ctxWeakMapMemoize } from "./UserContext";
import { UploadRow, UploadStatus } from "../types";
import DataLoader from "dataloader";
import { knex } from "../db";

export type UploadDebugData = {
  row: UploadRow;
};

export default class UploadModel {
  constructor(readonly ctx: UserContext, readonly row: UploadRow) {}

  static async fromMd5(ctx: UserContext, md5: string): Promise<UploadModel[]> {
    const rows = await getUploadLoader(ctx).load(md5);
    return rows.map((row) => new UploadModel(ctx, row));
  }

  getStatus(): UploadStatus {
    return this.row.status;
  }

  async debug(): Promise<UploadDebugData> {
    return {
      row: this.row,
    };
  }
}

const getUploadLoader = ctxWeakMapMemoize<DataLoader<string, UploadRow[]>>(
  () =>
    new DataLoader<string, UploadRow[]>(async (md5s) => {
      const rows = await knex("skin_uploads")
        .whereIn("skin_md5", md5s)
        .select();
      return md5s.map((md5) => rows.filter((x) => x.skin_md5 === md5));
    })
);
