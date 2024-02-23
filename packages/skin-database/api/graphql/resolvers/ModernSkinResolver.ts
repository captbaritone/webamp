import SkinResolver from "./SkinResolver";
import SkinModel from "../../../data/SkinModel";
import CommonSkinResolver, { ISkin } from "./CommonSkinResolver";
import { NodeResolver, toId } from "./NodeResolver";
import path from "path";
import { ID } from "grats";
import ReviewResolver from "./ReviewResolver";
import InternetArchiveItemResolver from "./InternetArchiveItemResolver";
import ArchiveFileResolver from "./ArchiveFileResolver";
import TweetResolver from "./TweetResolver";
import { XMLParser } from "fast-xml-parser";
import RootResolver from "./RootResolver";
import { GqlCtx } from "../GqlCtx";

/**
 * A "modern" Winamp skin. These skins use the `.wal` file extension and are free-form.
 *
 * Most functionality in the Winamp Skin Museum is centered around "classic" skins,
 * which are currently called just `Skin` in this schema.
 * @gqlType ModernSkin */
export default class ModernSkinResolver
  extends CommonSkinResolver
  implements NodeResolver, ISkin
{
  _model: SkinModel;
  __typename = "ModernSkin";
  /**
   * Filename of skin when uploaded to the Museum. Note: In some cases a skin
   * has been uploaded under multiple names. Here we just pick one.
   * @gqlField */
  async filename({
    normalize_extension = false,
  }: {
    /** If true, the the correct file extension (.wsz or .wal) will be .
      Otherwise, the original user-uploaded file extension will be used. */
    normalize_extension?: boolean | null;
  }): Promise<string> {
    const filename = await this._model.getFileName();
    if (normalize_extension) {
      return path.parse(filename).name + ".wal";
    }
    return filename;
  }

  /* TODO: Get all of these from the parent class/interface */

  /**
   * GraphQL ID of the skin
   * @gqlField
   * @killsParentOnException */
  id(): ID {
    return toId(this.__typename, this.md5());
  }

  /**
   * MD5 hash of the skin's file
   * @gqlField */
  md5(): string {
    return super.md5();
  }

  /**
   * URL to download the skin
   * @gqlField */
  download_url(): string {
    return super.download_url();
  }
  /**
   * Has the skin been tweeted?
   * @gqlField */
  tweeted(): Promise<boolean> {
    return super.tweeted();
  }
  /**
   * List of `@winampskins` tweets that mentioned the skin.
   * @gqlField */
  async tweets(): Promise<Array<TweetResolver | null>> {
    return super.tweets();
  }

  /**
   * List of files contained within the skin's .wsz archive
   * @gqlField */
  async archive_files(): Promise<Array<ArchiveFileResolver | null>> {
    return super.archive_files();
  }

  /**
   * The skin's "item" at archive.org
   * @gqlField */
  async internet_archive_item(): Promise<InternetArchiveItemResolver | null> {
    return super.internet_archive_item();
  }

  /**
   * Times that the skin has been reviewed either on the Museum's Tinder-style
   * reivew page, or via the Discord bot.
   * @gqlField */
  async reviews(): Promise<Array<ReviewResolver | null>> {
    return super.reviews();
  }

  /**
   * @gqlField
   * @deprecated Needed for migration */
  museum_url(): string | null {
    return null;
  }
  /**
   * @gqlField
   * @deprecated Needed for migration */
  webamp_url(): string | null {
    return null;
  }

  /** @gqlField */
  async screenshot_url(): Promise<string | null> {
    const archiveFiles = await this._model.getArchiveFiles();
    const skinXml = archiveFiles.find((f) =>
      f.getFileName().match(/skin\.xml$/i)
    );

    if (skinXml == null) {
      return null;
    }
    const xmlContent = await skinXml.getTextContent();
    if (xmlContent == null) {
      return null;
    }

    const parser = new XMLParser();
    const parsedXml = parser.parse(xmlContent);
    const screenshotPath =
      parsedXml?.WinampAbstractionLayer?.skininfo?.screenshot;
    if (screenshotPath == null) {
      return null;
    }

    const screenshotFile = archiveFiles.find((f) => {
      const fileName = f.getFileName().toLowerCase();
      const normalizedScreenshotPath = screenshotPath.toLowerCase();
      return (
        fileName === normalizedScreenshotPath ||
        fileName === `/${normalizedScreenshotPath}` ||
        fileName === `\\${normalizedScreenshotPath}`
      );
    });

    console.log({ screenshotFile });
    if (screenshotFile == null) {
      return null;
    }

    return screenshotFile.getUrl();
  }
  /**
   * @gqlField
   * @deprecated Needed for migration */
  async readme_text(): Promise<string | null> {
    return null;
  }
  /**
   * @gqlField
   * @deprecated Needed for migration */
  async nsfw(): Promise<boolean | null> {
    return null;
  }
  /**
   * @gqlField
   * @deprecated Needed for migration */
  average_color(): string | null {
    return null;
  }
}

/**
 * Get a skin by its MD5 hash
 * @gqlField
 */
export async function fetch_skin_by_md5(
  _: RootResolver,
  { md5 }: { md5: string },
  { ctx }: GqlCtx
): Promise<ISkin | null> {
  const skin = await SkinModel.fromMd5(ctx, md5);
  if (skin == null) {
    return null;
  }
  if (skin.getSkinType() === "MODERN") {
    return new ModernSkinResolver(skin);
  } else {
    return SkinResolver.fromModel(skin);
  }
}
