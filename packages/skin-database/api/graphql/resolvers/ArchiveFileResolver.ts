import { Int } from "grats";
import ArchiveFileModel from "../../../data/ArchiveFileModel";
import SkinModel from "../../../data/SkinModel";
import { ISkin } from "./CommonSkinResolver";
import SkinResolver from "./SkinResolver";

/** @gqlType ArchiveFile */
export default class ArchiveFileResolver {
  _model: ArchiveFileModel;
  constructor(model: ArchiveFileModel) {
    this._model = model;
  }

  /** @gqlField */
  filename(): string {
    return this._model.getFileName();
  }
  /** @gqlField */
  url(): string {
    return this._model.getUrl();
  }
  /** @gqlField */
  file_md5(): string {
    return this._model.getFileMd5();
  }
  /** @gqlField */
  size(): Promise<Int | null> {
    return this._model.getFileSize();
  }
  /** @gqlField */
  text_content(): Promise<string | null> {
    return this._model.getTextContent();
  }
  /** @gqlField */
  is_directory(): boolean {
    return this._model.getIsDirectory();
  }

  /** @gqlField */
  async skin(_: never, { ctx }): Promise<ISkin | null> {
    const model = await SkinModel.fromMd5Assert(ctx, this._model.getMd5());
    return SkinResolver.fromModel(model);
  }

  /** @gqlField */
  date(): string {
    return this._model.getFileDate().toISOString();
  }
}
