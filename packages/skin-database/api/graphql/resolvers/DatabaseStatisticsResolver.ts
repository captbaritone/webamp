import { Int } from "grats";
import * as Skins from "../../../data/skins";

/** @gqlType DatabaseStatistics */
export default class DatabaseStatisticsResolver {
  /** @gqlField */
  unique_classic_skins_count(): Promise<Int> {
    return Skins.getClassicSkinCount();
  }
  /** @gqlField */
  tweeted_skins_count(): Promise<Int> {
    return Skins.getTweetedSkinCount();
  }
  /** @gqlField */
  approved_skins_count(): Promise<Int> {
    return Skins.getApprovedSkinCount();
  }
  /** @gqlField */
  rejected_skins_count(): Promise<Int> {
    return Skins.getRejectedSkinCount();
  }
  /** @gqlField */
  nsfw_skins_count(): Promise<Int> {
    return Skins.getNsfwSkinCount();
  }
  /** @gqlField */
  unreviewed_skins_count(): Promise<Int> {
    return Skins.getUnreviewedSkinCount();
  }
  /** @gqlField */
  tweetable_skins_count(): Promise<Int> {
    return Skins.getTweetableSkinCount();
  }
  /** @gqlField */
  uploads_pending_processing_count(): Promise<Int> {
    return Skins.getUploadsAwaitingProcessingCount();
  }
  /** @gqlField */
  uploads_in_error_state_count(): Promise<Int> {
    return Skins.getUploadsErroredCount();
  }
  /** @gqlField */
  web_uploads_count(): Promise<Int> {
    return Skins.getWebUploadsCount();
  }
}
