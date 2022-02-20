import SkinModel from "../../../data/SkinModel";
import ArchiveFileResolver from "./ArchiveFileResolver";
import InternetArchiveItemResolver from "./InternetArchiveItemResolver";
import ReviewResolver from "./ReviewResolver";
import TweetResolver from "./TweetResolver";

export default class SkinResolver {
  _model: SkinModel;
  constructor(model: SkinModel) {
    this._model = model;
  }
  id() {
    return this._model.getId();
  }
  md5() {
    return this._model.getMd5();
  }
  filename() {
    return this._model.getFileName();
  }
  museum_url() {
    return this._model.getMuseumUrl();
  }
  webamp_url() {
    return this._model.getWebampUrl();
  }
  screenshot_url() {
    return this._model.getScreenshotUrl();
  }
  download_url() {
    return this._model.getSkinUrl();
  }
  readme_text() {
    return this._model.getReadme();
  }
  nsfw() {
    return this._model.getIsNsfw();
  }
  average_color() {
    return this._model.getAverageColor();
  }
  tweeted() {
    return this._model.tweeted();
  }
  async tweets() {
    const tweets = await this._model.getTweets();
    return tweets.map((tweetModel) => new TweetResolver(tweetModel));
  }
  async archive_files() {
    const files = await this._model.getArchiveFiles();
    return files.map((file) => new ArchiveFileResolver(file));
  }
  async internet_archive_item() {
    const item = await this._model.getIaItem();
    if (item == null) {
      return null;
    }
    return new InternetArchiveItemResolver(item);
  }

  async reviews() {
    const reviews = await this._model.getReviews();
    return reviews.map((row) => new ReviewResolver(row));
  }
}
