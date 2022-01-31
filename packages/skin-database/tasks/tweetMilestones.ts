import { getTwitterClient } from "../twitter";
import fs from "fs";
import DiscordEventHandler from "../api/DiscordEventHandler";

const MAX_CALL_COUNT = 2;

type TweetPayload = {
  created_at: string;
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

// Sort key/value entries by key largest to smallest
function sortEntries(a: [string, never], b: [string, never]): number {
  return Number(b[0]) - Number(a[0]);
}

export async function popularTweets(handler: DiscordEventHandler) {
  const twitterClient = getTwitterClient();

  const tweets = await getTweets(twitterClient);

  const currentJSON = fs.readFileSync(JSON_FILE_NAME, "utf8");
  const current: { [bracket: string]: string[] } = JSON.parse(currentJSON);

  for (const tweet of tweets) {
    let notified = false;
    for (const [_bracket, seen] of Object.entries(current).sort(sortEntries)) {
      const bracket = Number(_bracket);
      if (tweet.favorite_count > bracket && !seen.includes(tweet.id_str)) {
        seen.push(tweet.id_str);

        const url = tweetUrl(tweet);

        if (!notified) {
          await handler.handle({
            type: "POPULAR_TWEET",
            url,
            bracket,
            likes: tweet.favorite_count,
            date: new Date(Date.parse(tweet.created_at)),
          });
          notified = true;
        }

        fs.writeFileSync(JSON_FILE_NAME, JSON.stringify(current, null, 2));
      }
    }
  }
}

const FOLLOW_COUNT_FILE_NAME = "./followerCount.json";
const FOLLOW_COUNT_BRACKET_SIZE = 1000;

export async function followerCount(handler: DiscordEventHandler) {
  const twitterClient = getTwitterClient();

  const response = await twitterClient.get("users/show", {
    screen_name: "winampskins",
  });
  const user = response.data;

  const followerCount = user.followers_count;
  const currentJSON = fs.readFileSync(FOLLOW_COUNT_FILE_NAME, "utf8");
  const current: { count: number } = JSON.parse(currentJSON);
  const currentNumber = current.count;

  const nextMilestone = currentNumber + FOLLOW_COUNT_BRACKET_SIZE;

  if (followerCount > nextMilestone) {
    await handler.handle({
      type: "TWEET_BOT_MILESTONE",
      bracket: nextMilestone,
      count: followerCount,
    });
    fs.writeFileSync(
      FOLLOW_COUNT_FILE_NAME,
      JSON.stringify({ count: nextMilestone }, null, 2)
    );
  } else {
    console.log(`Not notifying: ${followerCount} < ${nextMilestone}`);
  }
}
