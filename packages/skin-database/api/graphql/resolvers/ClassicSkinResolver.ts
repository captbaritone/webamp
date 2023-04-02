import CommonSkinResolver, { ISkin } from "./CommonSkinResolver";
import { NodeResolver, toId } from "./NodeResolver";
import ReviewResolver from "./ReviewResolver";
import path from "path";
import { ID, Int } from "grats";
import TweetResolver from "./TweetResolver";
import ArchiveFileResolver from "./ArchiveFileResolver";
import InternetArchiveItemResolver from "./InternetArchiveItemResolver";

/** @gqlType ClassicSkin */
export default class ClassicSkinResolver
  extends CommonSkinResolver
  implements NodeResolver, ISkin
{
  __typename = "ClassicSkin";
  /**
   * @gqlField
   * @killsParentOnException
   */
  id(): ID {
    return toId(this.__typename, this.md5());
  }
  /** @gqlField */
  async filename({
    normalize_extension = false,
  }: {
    normalize_extension?: boolean;
  }): Promise<string> {
    const filename = await this._model.getFileName();
    if (normalize_extension) {
      return path.parse(filename).name + ".wsz";
    }
    return filename;
  }

  /** @gqlField */
  md5(): string {
    return super.md5();
  }
  /** @gqlField */
  download_url(): string {
    return super.download_url();
  }
  /** @gqlField */
  tweeted(): Promise<boolean> {
    return super.tweeted();
  }

  /** @gqlField */
  tweets(): Promise<TweetResolver[]> {
    return super.tweets();
  }

  /** @gqlField */
  archive_files(): Promise<ArchiveFileResolver[]> {
    return super.archive_files();
  }

  /** @gqlField */
  internet_archive_item(): Promise<InternetArchiveItemResolver | null> {
    return super.internet_archive_item();
  }
  /** @gqlField */
  museum_url(): string {
    return this._model.getMuseumUrl();
  }
  /** @gqlField */
  webamp_url(): string {
    return this._model.getWebampUrl();
  }
  /** @gqlField */
  screenshot_url(): string {
    return this._model.getScreenshotUrl();
  }
  /** @gqlField */
  readme_text(): Promise<string | null> {
    return this._model.getReadme();
  }
  /** @gqlField */
  nsfw(): Promise<boolean> {
    return this._model.getIsNsfw();
  }
  /** @gqlField */
  average_color(): string {
    return this._model.getAverageColor();
  }
  /** @gqlField */
  has_media_library(): Promise<boolean> {
    return this._model.hasMediaLibrary();
  }
  /** @gqlField */
  async reviews(): Promise<ReviewResolver[]> {
    const reviews = await this._model.getReviews();
    return reviews.map((row) => new ReviewResolver(row));
  }
  /** @gqlField */
  async last_algolia_index_update_date(): Promise<string | null> {
    const updates = await this._model.getAlgoliaIndexUpdates(1);
    if (updates.length < 1) {
      return null;
    }
    const update = updates[0];
    return new Date(update.update_timestamp * 1000).toISOString();
  }
  /** @gqlField */
  transparent_pixels(): Promise<Int> {
    return this._model.transparentPixels();
  }
}
