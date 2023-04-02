import SkinModel from "../../../data/SkinModel";
import CommonSkinResolver, { ISkin } from "./CommonSkinResolver";
import { NodeResolver, toId } from "./NodeResolver";
import path from "path";
import { ID } from "grats";
import ReviewResolver from "./ReviewResolver";
import InternetArchiveItemResolver from "./InternetArchiveItemResolver";
import ArchiveFileResolver from "./ArchiveFileResolver";
import TweetResolver from "./TweetResolver";

/** @gqlType ModernSkin */
export default class ModernSkinResolver
  extends CommonSkinResolver
  implements NodeResolver, ISkin
{
  _model: SkinModel;
  __typename = "ModernSkin";
  /** @gqlField */
  async filename({
    normalize_extension = false,
  }: {
    normalize_extension?: boolean;
  }): Promise<string> {
    const filename = await this._model.getFileName();
    if (normalize_extension) {
      return path.parse(filename).name + ".wal";
    }
    return filename;
  }

  /* TODO: Get all of these from the parent class/interface */

  /**
   * @gqlField
   * @killsParentOnException
   */
  id(): ID {
    return toId(this.__typename, this.md5());
  }

  /** @gqlField */
  md5(): string {
    return super.md5();
  }

  /** @gqlField */
  download_url(): string {
    return super.download_url();
  }
  /** @gqlField */
  tweeted(): Promise<boolean> {
    return super.tweeted();
  }
  /** @gqlField */
  async tweets(): Promise<TweetResolver[]> {
    return super.tweets();
  }

  /** @gqlField */
  async archive_files(): Promise<ArchiveFileResolver[]> {
    return super.archive_files();
  }

  /** @gqlField */
  async internet_archive_item(): Promise<InternetArchiveItemResolver | null> {
    return super.internet_archive_item();
  }

  /** @gqlField */
  async reviews(): Promise<ReviewResolver[] | null> {
    return super.reviews();
  }

  /** @gqlField */
  museum_url(): string | null {
    return null;
  }
  /** @gqlField */
  webamp_url(): string | null {
    return null;
  }

  /** @gqlField */
  screenshot_url(): string | null {
    return null;
  }
  /** @gqlField */
  async readme_text(): Promise<string | null> {
    return null;
  }
  /** @gqlField */
  async nsfw(): Promise<boolean | null> {
    return null;
  }
  /** @gqlField */
  average_color(): string | null {
    return null;
  }
}
