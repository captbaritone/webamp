import IaItemModel from "../../../data/IaItemModel";
import SkinModel from "../../../data/SkinModel";
import TweetModel from "../../../data/TweetModel";
import SkinResolver from "../resolvers/SkinResolver";
import TweetResolver from "../resolvers/TweetResolver";
import UserResolver from "../resolvers/UserResolver";
import SkinsConnection from "../SkinsConnection";
import TweetsConnection from "../TweetsConnection";
import InternetArchiveItemResolver from "./InternetArchiveItemResolver";
import * as Skins from "../../../data/skins";

import algoliasearch from "algoliasearch";
import MutationResolver from "./MutationResolver";
import { knex } from "../../../db";

// These keys are already in the web client, so they are not secret at all.
const client = algoliasearch("HQ9I5Z6IM5", "6466695ec3f624a5fccf46ec49680e51");
const index = client.initIndex("Skins");

class RootResolver extends MutationResolver {
  async fetch_skin_by_md5({ md5 }, { ctx }) {
    const skin = await SkinModel.fromMd5(ctx, md5);
    if (skin == null) {
      return null;
    }
    return new SkinResolver(skin);
  }
  async fetch_tweet_by_url({ url }, { ctx }) {
    const tweet = await TweetModel.fromAnything(ctx, url);
    if (tweet == null) {
      return null;
    }
    return new TweetResolver(tweet);
  }
  async fetch_internet_archive_item_by_identifier({ identifier }, { ctx }) {
    const iaItem = await IaItemModel.fromIdentifier(ctx, identifier);
    if (iaItem == null) {
      return null;
    }
    return new InternetArchiveItemResolver(iaItem);
  }

  async search_skins({ query, first, offset }, { ctx }) {
    if (first > 1000) {
      throw new Error("Can only query 1000 records via search.");
    }

    const results = await index.search(query, {
      attributesToRetrieve: ["md5"],
      length: first,
      offset,
    });

    return Promise.all(
      results.hits.map(async (hit) => {
        const model = await SkinModel.fromMd5Assert(ctx, hit.md5);
        return new SkinResolver(model);
      })
    );
  }

  async skins({ first, offset, sort, filter }) {
    if (first > 1000) {
      throw new Error("Maximum limit is 1000");
    }
    return new SkinsConnection(first, offset, sort, filter);
  }
  async skin_to_review(_args, { ctx }) {
    const { md5 } = await Skins.getSkinToReview();
    const model = await SkinModel.fromMd5Assert(ctx, md5);
    return new SkinResolver(model);
  }
  async tweets({ first, offset, sort }) {
    if (first > 1000) {
      throw new Error("Maximum limit is 1000");
    }
    return new TweetsConnection(first, offset, sort);
  }
  me() {
    return new UserResolver();
  }
  async upload_statuses_by_md5({ md5s }, { ctx }) {
    return this._upload_statuses({ keyName: "md5", keys: md5s }, ctx);
  }

  async upload_statuses({ ids }, { ctx }) {
    return this._upload_statuses({ keyName: "id", keys: ids }, ctx);
  }

  // Shared implementation for upload_statuses and upload_statuses_by_md5
  async _upload_statuses({ keyName, keys }, ctx) {
    const skins = await knex("skin_uploads")
      .whereIn(keyName, keys)
      .orderBy("id", "desc")
      .select("id", "skin_md5", "status");

    return Promise.all(
      skins.map(async ({ id, skin_md5, status }) => {
        // TODO: Could we avoid fetching the skin if it's not read?
        const skinModel = await SkinModel.fromMd5(ctx, skin_md5);
        const skin = skinModel == null ? null : new SkinResolver(skinModel);
        return { id, skin, status, upload_md5: skin_md5 };
      })
    );
  }
}

export default RootResolver;
