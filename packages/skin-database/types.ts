export type NsfwPrediction = {
  porn: number;
  neutral: number;
  sexy: number;
  hentai: number;
  drawing: number;
};

export type TweetStatus = "APPROVED" | "REJECTED" | "TWEETED" | "UNREVIEWED";
export type SkinType = "MODERN" | "CLASSIC";

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
  museumUrl: string;
  tweeted?: boolean;
  rejected?: boolean;
  approved?: boolean;
  nsfw?: boolean;
  nsfwPredictions?: NsfwPrediction;
  tweetStatus: TweetStatus;
  internetArchiveItemName: string | null;
  internetArchiveUrl: string | null;
};

export type SkinRow = {
  md5: string;
  skin_type: number;
  emails: string;
  readme_text: string;
  average_color: string;
};

export type TweetRow = {
  skin_md5: string;
  url: string;
  tweet_id: string;
  likes: number;
  retweets: number;
};

export type ReviewRow = {
  skin_md5: string;
  review: "APPROVED" | "REJECTED" | "NSFW";
};

export type FileRow = {
  skin_md5: string;
  file_path: string;
};

export type IaItemRow = {
  skin_md5: string;
  identifier: string;
};
