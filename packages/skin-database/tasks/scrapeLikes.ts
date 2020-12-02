//import fs from "fs";
import { getTwitterClient } from "../twitter";
import * as Skins from "../data/skins";
import { MD5_REGEX } from "../utils";

export const knownManualTweets = new Set([
  "1333662209436631043",
  "1307861036431679494",
  "1315066935353065472",
  "1315453111943614465",
  "1197689761269350400",
]);

const MAX_CALL_COUNT = 800;

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

function getMd5(tweet: TweetPayload): string | null {
  return (
    tweet.entities.urls
      .map(({ expanded_url }) => {
        const match = expanded_url.match(MD5_REGEX);
        return match != null ? match[0] : null;
      })
      .find(Boolean) ?? null
  );
}

export async function scrapeLikeData() {
  const twitterClient = getTwitterClient();

  const tweets = (await getTweets(twitterClient)).filter((tweet) => {
    // Ignore tweets that don't have links, or are known manual tweets.
    return !(
      tweet.entities.urls.length === 0 || knownManualTweets.has(tweet.id_str)
    );
  });

  const todo: TweetPayload[] = [];

  for (const tweet of tweets) {
    const success = await Skins.setTweetInfo(
      getMd5(tweet),
      tweet.favorite_count,
      tweet.retweet_count,
      tweet.id_str
    );
    if (!success) {
      console.warn(
        `Cannot insert skin without an md5 for tweet ${tweet.id_str}`
      );
      todo.push(tweet);
    }
  }

  // fs.writeFileSync("todo.json", JSON.stringify(todo));
}
