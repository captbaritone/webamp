import IaItemModel from "../../../data/IaItemModel";
import { ISkin } from "./CommonSkinResolver";
import SkinResolver from "./SkinResolver";

/** @gqlType InternetArchiveItem */
export default class InternetArchiveItemResolver {
  _model: IaItemModel;
  constructor(model: IaItemModel) {
    this._model = model;
  }
  /** @gqlField */
  identifier(): string {
    return this._model.getIdentifier();
  }
  /** @gqlField */
  url(): string {
    return this._model.getUrl();
  }
  /** @gqlField */
  metadata_url(): string {
    return this._model.getMetadataUrl();
  }

  /** @gqlField */
  last_metadata_scrape_date_UNSTABLE(): string | null {
    return this._model.getMetadataTimestamp();
  }

  /** @gqlField */
  raw_metadata_json(): string | null {
    return this._model.getMetadataJSON();
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
