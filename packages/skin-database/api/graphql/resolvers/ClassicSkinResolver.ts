import { ISkin } from "./CommonSkinResolver";
import { NodeResolver, toId } from "./NodeResolver";
import ReviewResolver from "./ReviewResolver";
import path from "path";
import { ID, Int } from "grats";
import SkinModel from "../../../data/SkinModel";

/**
 * A classic Winamp skin
 * @gqlType ClassicSkin */
export default class ClassicSkinResolver implements NodeResolver, ISkin {
  _model: SkinModel;
  __typename = "ClassicSkin";

  constructor(model: SkinModel) {
    this._model = model;
  }

  md5(): string {
    return this._model.getMd5();
  }

  id(): ID {
    return toId(this.__typename, this.md5());
  }
  async filename(normalize_extension?: boolean): Promise<string> {
    const filename = await this._model.getFileName();
    if (normalize_extension) {
      return path.parse(filename).name + ".wsz";
    }
    return filename;
  }

  museum_url(): string {
    return this._model.getMuseumUrl();
  }
  webamp_url(): string {
    return this._model.getWebampUrl();
  }
  async screenshot_url(): Promise<string> {
    return this._model.getScreenshotUrl();
  }
  readme_text(): Promise<string | null> {
    return this._model.getReadme();
  }
  nsfw(): Promise<boolean> {
    return this._model.getIsNsfw();
  }
  average_color(): string {
    return this._model.getAverageColor();
  }
  /**
   * Does the skin include sprite sheets for the media library?
   * @gqlField */
  has_media_library(): Promise<boolean> {
    return this._model.hasMediaLibrary();
  }

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
