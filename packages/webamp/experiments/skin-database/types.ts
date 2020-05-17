export type TweetStatus = "APPROVED" | "REJECTED" | "TWEETED" | "UNREVIEWED";

export type DBSkinRecord = {
  md5: string;
  averageColor?: string;
  emails?: string[];
  tweetUrl?: string;
  twitterLikes?: number;
  readmeText?: string;
  filePaths: string[];
  imageHash?: string;
  uploader?: string;
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
  imageHash?: string;
  uploader?: string;
  screenshotUrl: string;
  skinUrl: string;
  canonicalFilename: string | null;
  webampUrl: string;
};
