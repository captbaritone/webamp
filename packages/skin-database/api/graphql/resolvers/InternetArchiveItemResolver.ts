import IaItemModel from "../../../data/IaItemModel";
import { ISkin } from "./CommonSkinResolver";
import RootResolver from "./RootResolver";
import SkinResolver from "./SkinResolver";

/** @gqlType InternetArchiveItem */
export default class InternetArchiveItemResolver {
  _model: IaItemModel;
  constructor(model: IaItemModel) {
    this._model = model;
  }
  /**
   * The Internet Archive's unique identifier for this item
   * @gqlField
   */
  identifier(): string {
    return this._model.getIdentifier();
  }
  /**
   * The URL where this item can be viewed on the Internet Archive
   * @gqlField
   */
  url(): string {
    return this._model.getUrl();
  }
  /**
   * URL to get the Internet Archive's metadata for this item in JSON form.
   * @gqlField
   */
  metadata_url(): string {
    return this._model.getMetadataUrl();
  }

  /**
   * The date and time that we last scraped this item's metadata.
   * **Note:** This field is temporary and will be removed in the future.
   * The date format is just what we get from the database, and it's ambiguous.
   * @gqlField
   */
  last_metadata_scrape_date_UNSTABLE(): string | null {
    return this._model.getMetadataTimestamp();
  }

  /**
   * Our cached version of the metadata avaliable at \`metadata_url\` (above)
   * @gqlField
   */
  raw_metadata_json(): string | null {
    return this._model.getMetadataJSON();
  }
  /**
   * The skin that this item contains
   * @gqlField
   */
  async skin(): Promise<ISkin | null> {
    const skin = await this._model.getSkin();
    if (skin == null) {
      return null;
    }
    return SkinResolver.fromModel(skin);
  }
}

/**
 * Get an archive.org item by its identifier. You can find this in the URL:
 *
 * https://archive.org/details/<identifier>/
 * @gqlField
 */
export async function fetch_internet_archive_item_by_identifier(
  _: RootResolver,
  { identifier }: { identifier: string },
  { ctx }
): Promise<InternetArchiveItemResolver | null> {
  const iaItem = await IaItemModel.fromIdentifier(ctx, identifier);
  if (iaItem == null) {
    return null;
  }
  return new InternetArchiveItemResolver(iaItem);
}
