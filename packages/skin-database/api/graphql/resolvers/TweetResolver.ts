import TweetModel from "../../../data/TweetModel";
import SkinResolver from "./SkinResolver";

export default class TweetResolver {
  _model: TweetModel;
  constructor(model: TweetModel) {
    this._model = model;
  }

  url() {
    return this._model.getUrl();
  }
  likes() {
    return this._model.getLikes();
  }
  retweets() {
    return this._model.getRetweets();
  }
  async skin() {
    const skin = await this._model.getSkin();
    if (skin == null) {
      return null;
    }
    return SkinResolver.fromModel(skin);
  }
}
