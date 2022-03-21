import SkinModel from "../../../data/SkinModel";
import ArchiveFileResolver from "./ArchiveFileResolver";
import { NodeResolver, toId } from "./NodeResolver";

export default class ModernSkinResolver implements NodeResolver {
  _model: SkinModel;
  constructor(model: SkinModel) {
    this._model = model;
  }
  __typename = "ModernSkin";
  async id() {
    return toId(this.__typename, this.md5());
  }
  md5() {
    return this._model.getMd5();
  }
  filename() {
    return this._model.getFileName();
  }
  download_url() {
    return this._model.getSkinUrl();
  }
  async archive_files() {
    const files = await this._model.getArchiveFiles();
    return files.map((file) => new ArchiveFileResolver(file));
  }
}
