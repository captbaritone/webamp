import { Int } from "grats";
import ArchiveFileModel from "../../../data/ArchiveFileModel";
import SkinModel from "../../../data/SkinModel";
import { ISkin } from "./CommonSkinResolver";
import SkinResolver from "./SkinResolver";
import RootResolver from "./RootResolver";

/**
 * A file found within a Winamp Skin's .wsz archive
 * @gqlType ArchiveFile
 */
export default class ArchiveFileResolver {
  _model: ArchiveFileModel;
  constructor(model: ArchiveFileModel) {
    this._model = model;
  }

  /**
   * Filename of the file within the archive
   * @gqlField
   */
  filename(): string {
    return this._model.getFileName();
  }
  /**
   * A URL to download the file. **Note:** This is powered by a little
   * serverless Cloudflare function which tries to exctact the file on the fly.
   * It may not work for all files.
   * @gqlField
   */
  url(): string {
    return this._model.getUrl();
  }
  /**
   * The md5 hash of the file within the archive
   * @gqlField
   */
  file_md5(): string {
    return this._model.getFileMd5();
  }
  /**
   * The uncompressed size of the file in bytes.
   *
   * **Note:** Will be `null` for directories
   * @gqlField
   */
  size(): Promise<Int | null> {
    return this._model.getFileSize();
  }
  /**
   * The content of the file, if it's a text file
   * @gqlField
   */
  text_content(): Promise<string | null> {
    return this._model.getTextContent();
  }
  /**
   * Is the file a directory?
   * @gqlField
   */
  is_directory(): boolean {
    return this._model.getIsDirectory();
  }

  /**
   * The skin in which this file was found
   * @gqlField
   */
  async skin(_: never, { ctx }): Promise<ISkin | null> {
    const model = await SkinModel.fromMd5Assert(ctx, this._model.getMd5());
    return SkinResolver.fromModel(model);
  }

  /**
   * The date on the file inside the archive. Given in simplified extended ISO
   * format (ISO 8601).
   * @gqlField
   */
  date(): string {
    return this._model.getFileDate().toISOString();
  }
}

/**
 * Fetch archive file by it's MD5 hash
 *
 * Get information about a file found within a skin's wsz/wal/zip archive.
 * @gqlField
 */
export async function fetch_archive_file_by_md5(
  _: RootResolver,
  { md5 }: { md5: string },
  { ctx }
): Promise<ArchiveFileResolver | null> {
  const archiveFile = await ArchiveFileModel.fromFileMd5(ctx, md5);
  if (archiveFile == null) {
    return null;
  }
  return new ArchiveFileResolver(archiveFile);
}
