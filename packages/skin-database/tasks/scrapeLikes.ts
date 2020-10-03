import { getTwitterClient } from "../twitter";
import * as Skins from "../data/skins";
import { MD5_REGEX } from "../utils";

export async function scrapeLikeData() {
  const twitterClient = getTwitterClient();

  const COUNT = 3200;

  const tweets = await twitterClient.get("statuses/user_timeline", {
    screen_name: "winampskins",
    count: COUNT,
    exclude_replies: true,
    include_rts: false,
  });

  const data = tweets.data.map((tweet) => {
    const md5 = tweet.entities.urls
      .map(({ expanded_url }) => {
        const match = expanded_url.match(MD5_REGEX);
        return match != null ? match[0] : null;
      })
      .find(Boolean);
    return {
      tweetId: tweet.id_str,
      md5,
      likes: tweet.favorite_count,
      retweets: tweet.retweet_count,
    };
  });

  for (const tweet of data) {
    const { md5, tweetId, likes, retweets } = tweet;
    if (md5 == null) {
      continue;
    }
    await Skins.setTweetInfo(md5, likes, retweets, tweetId);
  }
}
