import { ID } from "grats";
import SkinModel from "../../../data/SkinModel";
import ReviewResolver from "./ReviewResolver";
import TweetModel from "../../../data/TweetModel";
import ArchiveFileModel from "../../../data/ArchiveFileModel";
import IaItemModel from "../../../data/IaItemModel";

/**
 * A Winamp skin. Could be modern or classic.
 * @gqlInterface Skin
 */
export interface ISkin {
  __typename: string;
  _model: SkinModel;
  id(): ID;
  filename(normalize_extension: boolean): Promise<string>;
  md5(): string;
  museum_url(): string | null;
  webamp_url(): string | null;
  screenshot_url(): Promise<string | null>;
  readme_text(): Promise<string | null>;
  nsfw(): Promise<boolean | null>;
  average_color(): string | null;
}

/**
 * URL of webamp.org with the skin loaded
 * @gqlField
 */
export function webamp_url(skin: ISkin): string | null {
  return skin.webamp_url();
}

/**
 * URL of a screenshot of the skin
 * @gqlField
 */
export function screenshot_url(skin: ISkin): Promise<string | null> {
  return skin.screenshot_url();
}

/**
 * Text of the readme file extracted from the skin
 * @gqlField
 */
export function readme_text(skin: ISkin): Promise<string | null> {
  return skin.readme_text();
}

/**
 * Has the skin been flagged as "not safe for work"?"
 * @gqlField
 */
export function nsfw(skin: ISkin): Promise<boolean | null> {
  return skin.nsfw();
}

/**
 * GraphQL ID of the skin
 * @gqlField
 * @killsParentOnException
 */
export function id(skin: ISkin): ID {
  return skin.id();
}

/**
 * Filename of skin when uploaded to the Museum. Note: In some cases a skin
 * has been uploaded under multiple names. Here we just pick one.
 * @gqlField
 */
export async function filename(
  skin: ISkin,
  {
    normalize_extension = false,
    include_museum_id = false,
  }: {
    /**
     * If true, the the correct file extension (.wsz or .wal) will be .
     * Otherwise, the original user-uploaded file extension will be used.
     */
    normalize_extension?: boolean;
    /**
     * If true, the museum ID will be appended to the filename to ensure filenames are globally unique.
     */
    include_museum_id?: boolean;
  }
): Promise<string> {
  const baseFilename = await skin.filename(normalize_extension);

  if (!include_museum_id) {
    return baseFilename;
  }

  const museumId = skin._model.getId();
  const segments = baseFilename.split(".");
  const fileExtension = segments.pop();

  return `${segments.join(".")}_[S${museumId}].${fileExtension}`;
}

/**
 * URL to download the skin
 * @gqlField
 */
export function download_url(skin: ISkin): string {
  return skin._model.getSkinUrl();
}

/**
 * Has the skin been tweeted?
 * @gqlField
 */
export function tweeted(skin: ISkin): Promise<boolean> {
  return skin._model.tweeted();
}

/**
 * List of @winampskins tweets that mentioned the skin.
 * @gqlField
 */
export function tweets(skin: ISkin): Promise<Array<TweetModel | null>> {
  return skin._model.getTweets();
}

/**
 * Times that the skin has been reviewed either on the Museum's Tinder-style
 * review page, or via the Discord bot.
 * @gqlField
 */
export async function reviews(
  skin: ISkin
): Promise<Array<ReviewResolver | null>> {
  const reviews = await skin._model.getReviews();
  return reviews.map((row) => new ReviewResolver(row));
}

/**
 * List of files contained within the skin's .wsz archive
 * @gqlField
 */
export function archive_files(
  skin: ISkin
): Promise<Array<ArchiveFileModel | null>> {
  return skin._model.getArchiveFiles();
}
/**
 * The skin's "item" at archive.org
 * @gqlField
 */
export function internet_archive_item(
  skin: ISkin
): Promise<IaItemModel | null> {
  return skin._model.getIaItem();
}

/**
 * URL of the skin on the Winamp Skin Museum
 * @gqlField
 */
export function museum_url(skin: ISkin): string | null {
  return skin.museum_url();
}

/**
 * String representation (rgb usually) of the skin's average color
 * @gqlField
 */
export function average_color(skin: ISkin): string | null {
  return skin.average_color();
}

/**
 * MD5 hash of the skin's file
 * @gqlField
 */
export function md5(skin: ISkin): string {
  return skin.md5();
}
