// Sourced from .env generally
export const CLOUDFLARE_PURGE_AUTH_KEY = env("CLOUDFLARE_PURGE_AUTH_KEY");
export const CAPTBARITONE_USER_ID = env("CAPTBARITONE_USER_ID");
export const TEST_CHANNEL_ID = env("TEST_CHANNEL_ID");
export const TWEET_BOT_CHANNEL_ID = env("TWEET_BOT_CHANNEL_ID");
export const SKIN_UPLOADS_CHANNEL_ID = env("SKIN_UPLOADS_CHANNEL_ID");
export const SKIN_REVIEW_CHANNEL_ID = env("SKIN_REVIEW_CHANNEL_ID");
export const NSFW_SKIN_CHANNEL_ID = env("NSFW_SKIN_CHANNEL_ID");
export const FEEDBACK_SKIN_CHANNEL_ID = env("FEEDBACK_SKIN_CHANNEL_ID");
export const POPULAR_TWEETS_CHANNEL_ID = env("POPULAR_TWEETS_CHANNEL_ID");
export const discordToken = env("DISCORD_TOKEN");
export const DISCORD_WEBAMP_SERVER_ID = env("DISCORD_WEBAMP_SERVER_ID");
export const DISCORD_CLIENT_ID = env("DISCORD_CLIENT_ID");
export const DISCORD_CLIENT_SECRET = env("DISCORD_CLIENT_SECRET");
export const DISCORD_REDIRECT_URL = env("DISCORD_REDIRECT_URL");
export const LOGIN_REDIRECT_URL = env("LOGIN_REDIRECT_URL");
export const ALGOLIA_ACCOUNT = env("ALGOLIA_ACCOUNT");
export const ALGOLIA_INDEX = env("ALGOLIA_INDEX");
export const ALGOLIA_KEY = env("ALGOLIA_KEY");
export const TWITTER_CREDS = {
  apiKey: env("TWITTER_API_KEY"),
  apiSecret: env("TWITTER_API_SECRET"),
  accessToken: env("TWITTER_ACCESS_TOKEN"),
  accessTokenSecret: env("TWITTER_ACCESS_TOKEN_SECRET"),
};
export const MASTODON_ACCESS_TOKEN = env("MASTODON_ACCESS_TOKEN");
export const INSTAGRAM_ACCESS_TOKEN = env("INSTAGRAM_ACCESS_TOKEN");
export const INSTAGRAM_ACCOUNT_ID = env("INSTAGRAM_ACCOUNT_ID");
// Used for session encryption
export const SECRET = env("SECRET");
export const NODE_ENV = env("NODE_ENV") || "production";

function env(key: string): string {
  const value = process.env[key];
  if (value == null) {
    throw new Error(`Expected an environment variable "${key}"`);
  }
  return value;
}
