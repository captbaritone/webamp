import { NsfwPrediction } from "./nsfwImage";

export type TweetStatus = "APPROVED" | "REJECTED" | "TWEETED" | "UNREVIEWED";

export type DBSkinRecord = {
  md5: string;
  averageColor?: string;
  emails?: string[];
  tweetUrl?: string;
  twitterLikes?: number;
  readmeText?: string;
  filePaths: string[];
  uploader?: string;
  tweeted?: boolean;
  rejected?: boolean;
  approved?: boolean;
  nsfw?: boolean;
  nsfwPredictions?: NsfwPrediction;
};

export type DBIARecord = {
  identifier: string;
};

export type SkinRecord = {
  md5: string;
  averageColor?: string;
  emails?: string[];
  tweetUrl?: string;
  twitterLikes?: number;
  readmeText?: string;
  fileNames: string[];
  uploader?: string;
  screenshotUrl: string;
  skinUrl: string;
  canonicalFilename: string | null;
  webampUrl: string;
  tweeted?: boolean;
  rejected?: boolean;
  approved?: boolean;
  nsfw?: boolean;
  nsfwPredictions?: NsfwPrediction;
  tweetStatus: TweetStatus;
  internetArchiveItemName: string | null;
  internetArchiveUrl: string | null;
};
