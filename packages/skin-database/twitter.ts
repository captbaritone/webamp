import { TWITTER_CREDS } from "./config";
import Twit from "twit";

export function getTwitterClient(): Twit {
  return new Twit({
    consumer_key: TWITTER_CREDS.apiKey,
    consumer_secret: TWITTER_CREDS.apiSecret,
    access_token: TWITTER_CREDS.accessToken,
    access_token_secret: TWITTER_CREDS.accessTokenSecret,
    strictSSL: true, // optional - requires SSL certificates to be valid.
  });
}
