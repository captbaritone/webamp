import CommonSkinResolver, { ISkin } from "./CommonSkinResolver";
import { NodeResolver, toId } from "./NodeResolver";
import ReviewResolver from "./ReviewResolver";
import path from "path";
import { ID, Int } from "grats";
import ArchiveFileResolver from "./ArchiveFileResolver";
import InternetArchiveItemResolver from "./InternetArchiveItemResolver";
import TweetModel from "../../../data/TweetModel";

/**
 * A classic Winamp skin
 * @gqlType ClassicSkin */
export default class ClassicSkinResolver
  extends CommonSkinResolver
  implements NodeResolver, ISkin
{
  __typename = "ClassicSkin";
  /**
   * GraphQL ID of the skin
   * @gqlField
   * @killsParentOnException
   */
  id(): ID {
    return toId(this.__typename, this.md5());
  }
  /**
   * Filename of skin when uploaded to the Museum. Note: In some cases a skin
   * has been uploaded under multiple names. Here we just pick one.
   * @gqlField */
  async filename({
    normalize_extension = false,
  }: {
    /** If true, the the correct file extension (.wsz or .wal) will be .
    Otherwise, the original user-uploaded file extension will be used. */
    normalize_extension?: boolean;
  }): Promise<string> {
    const filename = await this._model.getFileName();
    if (normalize_extension) {
      return path.parse(filename).name + ".wsz";
    }
    return filename;
  }

  /**
   * MD5 hash of the skin's file
   * @gqlField */
  md5(): string {
    return super.md5();
  }
  /**
   * URL to download the skin
   * @gqlField */
  download_url(): string {
    return super.download_url();
  }
  /**
   * Has the skin been tweeted?
   * @gqlField */
  tweeted(): Promise<boolean> {
    return super.tweeted();
  }

  /**
   * List of @winampskins tweets that mentioned the skin.
   * @gqlField */
  tweets(): Promise<Array<TweetModel | null>> {
    return super.tweets();
  }

  /**
   * List of files contained within the skin's .wsz archive
   * @gqlField */
  archive_files(): Promise<Array<ArchiveFileResolver | null>> {
    return super.archive_files();
  }

  /**
   * The skin's "item" at archive.org
   * @gqlField */
  internet_archive_item(): Promise<InternetArchiveItemResolver | null> {
    return super.internet_archive_item();
  }
  /**
   * URL of the skin on the Winamp Skin Museum
   * @gqlField */
  museum_url(): string {
    return this._model.getMuseumUrl();
  }
  /**
   * URL of webamp.org with the skin loaded
   * @gqlField */
  webamp_url(): string {
    return this._model.getWebampUrl();
  }
  /**
   * URL of a screenshot of the skin
   * @gqlField */
  async screenshot_url(): Promise<string> {
    return this._model.getScreenshotUrl();
  }
  /**
   * Text of the readme file extracted from the skin
   * @gqlField */
  readme_text(): Promise<string | null> {
    return this._model.getReadme();
  }
  /**
   * Has the skin been flagged as "not safe for wrok"?
   * @gqlField */
  nsfw(): Promise<boolean> {
    return this._model.getIsNsfw();
  }
  /**
   * String representation (rgb usually) of the skin's average color
   * @gqlField */
  average_color(): string {
    return this._model.getAverageColor();
  }
  /**
   * Does the skin include sprite sheets for the media library?
   * @gqlField */
  has_media_library(): Promise<boolean> {
    return this._model.hasMediaLibrary();
  }
  /**
   * Times that the skin has been reviewed either on the Museum's Tinder-style
   * reivew page, or via the Discord bot.
   * @gqlField */
  async reviews(): Promise<Array<ReviewResolver | null>> {
    const reviews = await this._model.getReviews();
    return reviews.map((row) => new ReviewResolver(row));
  }
  /**
   * The date on which this skin was last updated in the Algolia search index.
   * Given in simplified extended ISO format (ISO 8601).
   * @gqlField */
  async last_algolia_index_update_date(): Promise<string | null> {
    const updates = await this._model.getAlgoliaIndexUpdates(1);
    if (updates.length < 1) {
      return null;
    }
    const update = updates[0];
    return new Date(update.update_timestamp * 1000).toISOString();
  }
  /**
   * The number of transparent pixels rendered by the skin.
   * @gqlField */
  transparent_pixels(): Promise<Int> {
    return this._model.transparentPixels();
  }
}
