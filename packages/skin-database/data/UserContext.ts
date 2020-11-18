import { knex } from "../db";

import DataLoader from "dataloader";
import { SkinRow, TweetRow, ReviewRow, FileRow, IaItemRow } from "../types";

export default class UserContext {
  skin: DataLoader<string, SkinRow | null>;
  tweet: DataLoader<string, TweetRow | null>;
  reviews: DataLoader<string, ReviewRow[]>;
  file: DataLoader<string, FileRow>;
  iaItem: DataLoader<string, IaItemRow>;
  constructor() {
    this.skin = new DataLoader(async (md5s) => {
      const rows = await knex("skins").whereIn("md5", md5s).select();
      return md5s.map((md5) => rows.find((x) => x.md5 === md5));
    });
    this.tweet = new DataLoader(async (md5s) => {
      const rows = await knex("tweets").whereIn("skin_md5", md5s).select();
      return md5s.map((md5) => rows.find((x) => x.skin_md5 === md5));
    });
    this.reviews = new DataLoader(async (md5s) => {
      const rows = await knex("skin_reviews")
        .whereIn("skin_md5", md5s)
        .select();
      return md5s.map((md5) => rows.filter((x) => x.skin_md5 === md5));
    });
    this.file = new DataLoader(async (md5s) => {
      const rows = await knex("files").whereIn("skin_md5", md5s).select();
      return md5s.map((md5) => rows.find((x) => x.skin_md5 === md5));
    });
    this.iaItem = new DataLoader(async (md5s) => {
      const rows = await knex("ia_items").whereIn("skin_md5", md5s).select();
      return md5s.map((md5) => rows.find((x) => x.skin_md5 === md5));
    });
  }
}
