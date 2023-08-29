import { ID } from "grats";
import SkinModel from "../../../data/SkinModel";
import ArchiveFileResolver from "./ArchiveFileResolver";
import InternetArchiveItemResolver from "./InternetArchiveItemResolver";
import ReviewResolver from "./ReviewResolver";
import TweetModel from "../../../data/TweetModel";

/**
 * A Winamp skin. Could be modern or classic.
 *
 * **Note**: At some point in the future, this might be renamed to `Skin`.
 * @gqlInterface Skin
 */
export interface ISkin {
  __typename: string;
  /**
   * GraphQL ID of the skin
   * @gqlField
   * @killsParentOnException
   */
  id(): ID;

  /**
   * Filename of skin when uploaded to the Museum. Note: In some cases a skin
   * has been uploaded under multiple names. Here we just pick one.
   * @gqlField
   */
  filename({
    normalize_extension = false,
  }: {
    /**
     * If true, the the correct file extension (.wsz or .wal) will be .
     * Otherwise, the original user-uploaded file extension will be used.
     */
    normalize_extension?: boolean;
  }): Promise<string>;

  /**
   * MD5 hash of the skin's file
   * @gqlField
   */
  md5(): string;

  /**
   * URL to download the skin
   * @gqlField
   */
  download_url(): string;

  /**
   * Has the skin been tweeted?
   * @gqlField
   */
  tweeted(): Promise<boolean>;

  /**
   * List of @winampskins tweets that mentioned the skin.
   * @gqlField
   */
  tweets(): Promise<Array<TweetModel | null>>;

  /**
   * List of files contained within the skin's .wsz archive
   * @gqlField
   */
  archive_files(): Promise<Array<ArchiveFileResolver | null>>;

  /**
   * The skin's "item" at archive.org
   * @gqlField
   */
  internet_archive_item(): Promise<InternetArchiveItemResolver | null>;

  /**
   * Times that the skin has been reviewed either on the Museum's Tinder-style
   * reivew page, or via the Discord bot.
   * @gqlField
   */
  reviews(): Promise<Array<ReviewResolver | null>>;

  /**
   * @gqlField
   * @deprecated Needed for migration
   */
  museum_url(): string | null;

  /**
   * @gqlField
   * @deprecated Needed for migration
   */
  webamp_url(): string | null;

  /** @gqlField */
  screenshot_url(): Promise<string | null>;

  /**
   * @gqlField
   * @deprecated Needed for migration */
  readme_text(): Promise<string | null>;

  /**
   * @gqlField
   * @deprecated Needed for migration */
  nsfw(): Promise<boolean | null>;

  /**
   * @gqlField
   * @deprecated Needed for migration */
  average_color(): string | null;
}

export default abstract class CommonSkinResolver {
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
  async tweets(): Promise<Array<TweetModel | null>> {
    return this._model.getTweets();
  }
  async archive_files(): Promise<Array<ArchiveFileResolver | null>> {
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

  async reviews(): Promise<Array<ReviewResolver | null>> {
    const reviews = await this._model.getReviews();
    return reviews.map((row) => new ReviewResolver(row));
  }
}
