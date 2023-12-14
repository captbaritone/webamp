import { Int } from "grats";
import TweetModel from "../../../data/TweetModel";
import { ISkin } from "./CommonSkinResolver";
import SkinResolver from "./SkinResolver";
import RootResolver from "./RootResolver";
import { GqlCtx } from "../GqlCtx";

/**
 * A tweet made by `@winampskins` mentioning a Winamp skin
 * @gqlType Tweet
 */
export default class TweetResolver {
  _model: TweetModel;
  constructor(model: TweetModel) {
    this._model = model;
  }

  /**
   * URL of the tweet. **Note:** Early on in the bot's life we just recorded
   * _which_ skins were tweeted, not any info about the actual tweet. This means we
   * don't always know the URL of the tweet.
   * @gqlField
   */
  url(): string | null {
    return this._model.getUrl();
  }
  /**
   * Number of likes the tweet has received. Updated nightly. (Note: Recent likes on older tweets may not be reflected here)
   * @gqlField
   */
  likes(): Int {
    return this._model.getLikes();
  }
  /**
   * Number of retweets the tweet has received. Updated nightly. (Note: Recent retweets on older tweets may not be reflected here)
   * @gqlField
   */
  retweets(): Int {
    return this._model.getRetweets();
  }
  /**
   * The skin featured in this Tweet
   * @gqlField
   */
  async skin(): Promise<ISkin | null> {
    const skin = await this._model.getSkin();
    if (skin == null) {
      return null;
    }
    return SkinResolver.fromModel(skin);
  }
}

/**
 * Get a tweet by its URL
 * @gqlField
 */
export async function fetch_tweet_by_url(
  _: RootResolver,
  { url }: { url: string },
  { ctx }: GqlCtx
): Promise<TweetResolver | null> {
  const tweet = await TweetModel.fromAnything(ctx, url);
  if (tweet == null) {
    return null;
  }
  return new TweetResolver(tweet);
}
