import IaItemModel from "../../../data/IaItemModel";
import SkinResolver from "./SkinResolver";

export default class InternetArchiveItemResolver {
  _model: IaItemModel;
  constructor(model: IaItemModel) {
    this._model = model;
  }
  identifier() {
    return this._model.getIdentifier();
  }
  url() {
    return this._model.getUrl();
  }
  metadata_url() {
    return this._model.getMetadataUrl();
  }

  last_metadata_scrape_date_UNSTABLE() {
    return this._model.getMetadataTimestamp();
  }

  raw_metadata_json() {
    return this._model.getMetadataJSON();
  }
  async skin() {
    const skin = await this._model.getSkin();
    if (skin == null) {
      return null;
    }
    return SkinResolver.fromModel(skin);
  }
}
