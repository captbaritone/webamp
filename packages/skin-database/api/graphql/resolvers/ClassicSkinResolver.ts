import CommonSkinResolver from "./CommonSkinResolver";
import { NodeResolver, toId } from "./NodeResolver";
import ReviewResolver from "./ReviewResolver";
import path from "path";

export default class ClassicSkinResolver
  extends CommonSkinResolver
  implements NodeResolver
{
  __typename = "ClassicSkin";
  async id() {
    return toId(this.__typename, this.md5());
  }
  async filename(normalize_extension = false) {
    const filename = await this._model.getFileName();
    if (normalize_extension) {
      return path.parse(filename).name + ".wsz";
    }
    return filename;
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
  readme_text() {
    return this._model.getReadme();
  }
  nsfw() {
    return this._model.getIsNsfw();
  }
  average_color() {
    return this._model.getAverageColor();
  }
  has_media_library(): Promise<boolean> {
    return this._model.hasMediaLibrary();
  }
  async reviews() {
    const reviews = await this._model.getReviews();
    return reviews.map((row) => new ReviewResolver(row));
  }
  async last_algolia_index_update_date() {
    const updates = await this._model.getAlgoliaIndexUpdates(1);
    if (updates.length < 1) {
      return null;
    }
    const update = updates[0];
    return new Date(update.update_timestamp * 1000).toISOString();
  }
  transparent_pixels(): Promise<number> {
    return this._model.transparentPixels();
  }
}
