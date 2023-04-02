import { ID } from "grats";
import SkinModel from "../../../data/SkinModel";
import ArchiveFileResolver from "./ArchiveFileResolver";
import InternetArchiveItemResolver from "./InternetArchiveItemResolver";
import ReviewResolver from "./ReviewResolver";
import TweetResolver from "./TweetResolver";

/** @gqlInterface Skin */
export interface ISkin {
  __typename: string;
  /**
   * @gqlField
   * @killsParentOnException
   */
  id(): ID;

  /** @gqlField */
  filename({
    normalize_extension = false,
  }: {
    normalize_extension?: boolean;
  }): Promise<string>;

  /** @gqlField */
  md5(): string;

  /** @gqlField */
  download_url(): string;

  /** @gqlField */
  tweeted(): Promise<boolean>;

  /** @gqlField */
  tweets(): Promise<TweetResolver[]>;

  /** @gqlField */
  archive_files(): Promise<ArchiveFileResolver[]>;

  /** @gqlField */
  internet_archive_item(): Promise<InternetArchiveItemResolver | null>;

  /** @gqlField */
  reviews(): Promise<ReviewResolver[] | null>;

  /**
   * @gqlField
   * @deprecated Needed for migration to new skin model
   */
  museum_url(): string | null;

  /**
   * @gqlField
   * @deprecated Needed for migration to new skin model
   */
  webamp_url(): string | null;

  /**
   * @gqlField
   * @deprecated Needed for migration to new skin model
   */
  screenshot_url(): string | null;

  /**
   * @gqlField
   * @deprecated Needed for migration to new skin model
   */
  readme_text(): Promise<string | null>;

  /**
   * @gqlField
   * @deprecated Needed for migration to new skin model
   */
  nsfw(): Promise<boolean | null>;

  /**
   * @gqlField
   * @deprecated Needed for migration to new skin model
   */
  average_color(): string | null;
}

export default class CommonSkinResolver {
  _model: SkinModel;
  constructor(model: SkinModel) {
    this._model = model;
  }
  md5(): string {
    return this._model.getMd5();
  }

  download_url(): string {
    return this._model.getSkinUrl();
  }
  tweeted(): Promise<boolean> {
    return this._model.tweeted();
  }
  async tweets(): Promise<TweetResolver[]> {
    const tweets = await this._model.getTweets();
    return tweets.map((tweetModel) => new TweetResolver(tweetModel));
  }
  async archive_files(): Promise<ArchiveFileResolver[]> {
    const files = await this._model.getArchiveFiles();
    return files.map((file) => new ArchiveFileResolver(file));
  }
  async internet_archive_item(): Promise<InternetArchiveItemResolver | null> {
    const item = await this._model.getIaItem();
    if (item == null) {
      return null;
    }
    return new InternetArchiveItemResolver(item);
  }

  async reviews(): Promise<ReviewResolver[] | null> {
    const reviews = await this._model.getReviews();
    return reviews.map((row) => new ReviewResolver(row));
  }
}
