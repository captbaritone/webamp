import UserContext, { ctxWeakMapMemoize } from "./UserContext";
import { InstagramPostRow } from "../types";
import DataLoader from "dataloader";
import { knex } from "../db";
import SkinModel from "./SkinModel";

export type InstagramPostDebugData = {
  row: InstagramPostRow;
};

export default class InstagramPostModel {
  constructor(readonly ctx: UserContext, readonly row: InstagramPostRow) {}

  static async fromMd5(
    ctx: UserContext,
    md5: string
  ): Promise<InstagramPostModel[]> {
    const rows = await getInstagramPostsLoader(ctx).load(md5);
    return rows.map((row) => new InstagramPostModel(ctx, row));
  }

  static async fromInstagramPostId(
    ctx: UserContext,
    instagramPostId: string
  ): Promise<InstagramPostModel | null> {
    const row = await getInstagramPostsByPostIdLoader(ctx).load(
      instagramPostId
    );
    if (row == null) {
      return null;
    }
    return new InstagramPostModel(ctx, row);
  }

  getMd5(): string {
    return this.row.skin_md5;
  }

  getInstagramPostId(): string {
    return this.row.post_id;
  }

  getUrl(): string {
    return this.row.url;
  }

  async getSkin(): Promise<SkinModel> {
    return SkinModel.fromMd5Assert(this.ctx, this.getMd5());
  }

  async debug(): Promise<InstagramPostDebugData> {
    return {
      row: this.row,
    };
  }
}

const getInstagramPostsLoader = ctxWeakMapMemoize<
  DataLoader<string, InstagramPostRow[]>
>(
  () =>
    new DataLoader(async (md5s) => {
      const rows = await knex("instagram_posts")
        .whereIn("skin_md5", md5s)
        .select();
      return md5s.map((md5) => rows.filter((x) => x.skin_md5 === md5));
    })
);

const getInstagramPostsByPostIdLoader = ctxWeakMapMemoize<
  DataLoader<string, InstagramPostRow>
>(
  () =>
    new DataLoader(async (ids) => {
      const rows = await knex("instagram_posts")
        .whereIn("post_id", ids)
        .select();
      return ids.map((id) => rows.find((x) => x.tweet_id === id));
    })
);
