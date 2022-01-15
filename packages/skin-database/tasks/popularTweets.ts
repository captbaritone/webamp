import { getTwitterClient } from "../twitter";
import fs from "fs";
import DiscordEventHandler from "../api/DiscordEventHandler";

const MAX_CALL_COUNT = 2;

type TweetPayload = {
  entities: {
    urls: {
      expanded_url: string;
    }[];
  };
  text: string;
  id_str: string;
  favorite_count: number;
  retweet_count: number;
};

async function getTweets(twitterClient): Promise<TweetPayload[]> {
  let max_id: string | undefined = undefined;
  let tweets: TweetPayload[] = [];
  let callCount = 0;

  while (callCount < MAX_CALL_COUNT) {
    callCount++;
    const response = await twitterClient.get("statuses/user_timeline", {
      max_id,
      screen_name: "winampskins",
      exclude_replies: true,
      include_rts: false,
    });
    tweets = tweets.concat(response.data);
    const newMaxId = tweets.map((tweet) => tweet.id_str).sort()[0];
    if (newMaxId === max_id) {
      console.warn(`Got the same max id ${max_id}`);
      return tweets;
    }

    max_id = newMaxId;
    if (response.data.length <= 1) {
      return tweets;
    }
  }

  return tweets;
}

function tweetUrl(tweet: { id_str: string }) {
  return `https://twitter.com/winampskins/status/${tweet.id_str}`;
}

const JSON_FILE_NAME = "./popularTweets.json";

export async function popularTweets(handler: DiscordEventHandler) {
  const twitterClient = getTwitterClient();

  const tweets = await getTweets(twitterClient);

  const currentJSON = fs.readFileSync(JSON_FILE_NAME, "utf8");
  const current: { [bracket: string]: string[] } = JSON.parse(currentJSON);

  for (const tweet of tweets) {
    for (const [_bracket, seen] of Object.entries(current)) {
      const bracket = Number(_bracket);
      if (tweet.favorite_count > bracket && !seen.includes(tweet.id_str)) {
        seen.push(tweet.id_str);

        const url = tweetUrl(tweet);

        await handler.handle({ type: "POPULAR_TWEET", url, bracket });

        fs.writeFileSync(JSON_FILE_NAME, JSON.stringify(current, null, 2));
      }
    }
  }
}
