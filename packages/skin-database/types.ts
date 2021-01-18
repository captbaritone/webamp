export type TweetStatus =
  | "APPROVED"
  | "REJECTED"
  | "TWEETED"
  | "UNREVIEWED"
  | "NSFW";

export type SkinType = "MODERN" | "CLASSIC";

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
  reviewer: string;
};

export type FileRow = {
  skin_md5: string;
  file_path: string;
};

export type ArchiveFileRow = {
  skin_md5: string;
  file_name: string;
  file_md5: string;
  file_date: string;
};

export type IaItemRow = {
  skin_md5: string;
  identifier: string;
};

export type UploadStatus =
  | "UPLOAD_REPORTED"
  | "URL_REQUESTED"
  | "ERRORED"
  | "ARCHIVED";

export type UploadRow = {
  skin_md5: string;
  id: string;
  status: UploadStatus;
};
