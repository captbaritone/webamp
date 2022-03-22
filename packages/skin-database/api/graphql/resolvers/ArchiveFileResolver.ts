import ArchiveFileModel from "../../../data/ArchiveFileModel";
import SkinModel from "../../../data/SkinModel";
import SkinResolver from "./SkinResolver";

export default class ArchiveFileResolver {
  _model: ArchiveFileModel;
  constructor(model: ArchiveFileModel) {
    this._model = model;
  }
  filename() {
    return this._model.getFileName();
  }
  url() {
    return this._model.getUrl();
  }
  file_md5() {
    return this._model.getFileMd5();
  }
  size() {
    return this._model.getFileSize();
  }
  text_content() {
    return this._model.getTextContent();
  }
  is_directory() {
    return this._model.getIsDirectory();
  }
  async skin(_, { ctx }) {
    const model = await SkinModel.fromMd5Assert(ctx, this._model.getMd5());
    return SkinResolver.fromModel(model);
  }
  date() {
    return this._model.getFileDate().toISOString();
  }
}
