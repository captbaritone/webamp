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
  async skin() {
    const skin = await this._model.getSkin();
    if (skin == null) {
      return null;
    }
    return new SkinResolver(skin);
  }
}
