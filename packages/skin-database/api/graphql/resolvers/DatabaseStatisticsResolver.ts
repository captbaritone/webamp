import { Int } from "grats";
import * as Skins from "../../../data/skins";
import RootResolver from "./RootResolver";

/**
 * Statistics about the contents of the Museum's database.
 * @gqlType DatabaseStatistics
 */
export default class DatabaseStatisticsResolver {
  /**
   * The total number of classic skins in the Museum's database
   * @gqlField
   */
  unique_classic_skins_count(): Promise<Int> {
    return Skins.getClassicSkinCount();
  }
  /**
   * The number of skins in the Museum that have been tweeted by @winampskins
   * @gqlField
   */
  tweeted_skins_count(): Promise<Int> {
    return Skins.getTweetedSkinCount();
  }
  /**
   * The number of skins that have been approved for tweeting. This includes both
   * tweeted and untweeted skins.
   *
   * **Note:** Skins can be both approved and rejected by different users.
   * @gqlField
   */
  approved_skins_count(): Promise<Int> {
    return Skins.getApprovedSkinCount();
  }
  /**
   * The number of skins that have been rejected for tweeting.
   *
   * **Note:** Skins can be both approved and rejected by different users.
   * **Note:** Generally skins that have been marked NSFW are also marked as rejected.
   * @gqlField
   */
  rejected_skins_count(): Promise<Int> {
    return Skins.getRejectedSkinCount();
  }
  /**
   * The number of skins that have been marked as NSFW.
   *
   * **Note:** Skins can be approved and rejected by different users.
   * **Note:** Generally skins that have been marked NSFW are also marked as rejected.
   * @gqlField
   */
  nsfw_skins_count(): Promise<Int> {
    return Skins.getNsfwSkinCount();
  }
  /**
   * The number of skins that have never been reviewed.
   * @gqlField
   */
  unreviewed_skins_count(): Promise<Int> {
    return Skins.getUnreviewedSkinCount();
  }
  /**
   * The number of skins that have been approved for tweeting, but not yet tweeted.
   * @gqlField
   */
  tweetable_skins_count(): Promise<Int> {
    return Skins.getTweetableSkinCount();
  }
  /**
   * Skins uplaods awaiting processing. This can happen when there are a large
   * number of skin uplaods at the same time, or when the skin uploading processing
   * pipeline gets stuck.
   * @gqlField
   */
  uploads_pending_processing_count(): Promise<Int> {
    return Skins.getUploadsAwaitingProcessingCount();
  }
  /**
   * Skins uploads that have errored during processing.
   * @gqlField
   */
  uploads_in_error_state_count(): Promise<Int> {
    return Skins.getUploadsErroredCount();
  }
  /**
   * Number of skins that have been uploaded to the Museum via the web interface.
   * @gqlField
   */
  web_uploads_count(): Promise<Int> {
    return Skins.getWebUploadsCount();
  }
}

/**
 * A namespace for statistics about the database
 * @gqlField */
export function statistics(_: RootResolver): DatabaseStatisticsResolver {
  return new DatabaseStatisticsResolver();
}
