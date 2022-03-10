import * as Skins from "../../../data/skins";

export default class DatabaseStatisticsResolver {
  unique_classic_skins_count(): Promise<number> {
    return Skins.getClassicSkinCount();
  }
  tweeted_skins_count(): Promise<number> {
    return Skins.getTweetedSkinCount();
  }
  approved_skins_count(): Promise<number> {
    return Skins.getApprovedSkinCount();
  }
  rejected_skins_count(): Promise<number> {
    return Skins.getRejectedSkinCount();
  }
  nsfw_skins_count(): Promise<number> {
    return Skins.getNsfwSkinCount();
  }
  unreviewed_skins_count(): Promise<number> {
    return Skins.getUnreviewedSkinCount();
  }
  tweetable_skins_count(): Promise<number> {
    return Skins.getTweetableSkinCount();
  }
  uploads_pending_processing_count(): Promise<number> {
    return Skins.getUploadsAwaitingProcessingCount();
  }
  uploads_in_error_state_count(): Promise<number> {
    return Skins.getUploadsErroredCount();
  }
  web_uploads_count(): Promise<number> {
    return Skins.getWebUploadsCount();
  }
}
