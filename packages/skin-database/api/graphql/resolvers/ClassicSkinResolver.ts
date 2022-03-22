import CommonSkinResolver from "./CommonSkinResolver";
import { NodeResolver, toId } from "./NodeResolver";
import ReviewResolver from "./ReviewResolver";

export default class ClassicSkinResolver
  extends CommonSkinResolver
  implements NodeResolver
{
  __typename = "ClassicSkin";
  async id() {
    return toId(this.__typename, this.md5());
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
  async reviews() {
    const reviews = await this._model.getReviews();
    return reviews.map((row) => new ReviewResolver(row));
  }
}
