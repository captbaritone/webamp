import ArchiveFileModel from "../../../data/ArchiveFileModel";

export default class ArchiveFileResolver {
  _model: ArchiveFileModel;
  constructor(model: ArchiveFileModel) {
    this._model = model;
  }
  filename() {
    return this._model.getFileName();
  }
}
