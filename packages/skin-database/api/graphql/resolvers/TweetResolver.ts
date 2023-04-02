import { Int } from "grats";
import TweetModel from "../../../data/TweetModel";
import { ISkin } from "./CommonSkinResolver";
import SkinResolver from "./SkinResolver";

/** @gqlType Tweet */
export default class TweetResolver {
  _model: TweetModel;
  constructor(model: TweetModel) {
    this._model = model;
  }

  /** @gqlField */
  url(): string | null {
    return this._model.getUrl();
  }
  /** @gqlField */
  likes(): Int {
    return this._model.getLikes();
  }
  /** @gqlField */
  retweets(): Int {
    return this._model.getRetweets();
  }
  /** @gqlField */
  async skin(): Promise<ISkin | null> {
    const skin = await this._model.getSkin();
    if (skin == null) {
      return null;
    }
    return SkinResolver.fromModel(skin);
  }
}
