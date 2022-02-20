import { Router } from "express";
import { graphqlHTTP } from "express-graphql";

import { buildSchema } from "graphql";
import SkinModel from "../../data/SkinModel";
import TweetModel from "../../data/TweetModel";
import SkinResolver from "./resolvers/SkinResolver";
import TweetResolver from "./resolvers/TweetResolver";
import UserResolver from "./resolvers/UserResolver";
import SkinsConnection from "./SkinsConnection";
import TweetsConnection from "./TweetsConnection";

const router = Router();

const schema = buildSchema(`
"""A classic Winamp skin"""
type Skin {
  """Database ID of the skin"""
  id: Int,

  """MD5 hash of the skin's file"""
  md5: String,

  """URL of the skin on the Winamp Skin Museum"""
  museum_url: String,

  """URL of webamp.org with the skin loaded"""
  webamp_url: String,

  """URL of a screenshot of the skin"""
  screenshot_url: String,

  """URL to download the skin"""
  download_url: String,

  """
  Filename of skin when uploaded to the Museum. Note: In some cases a skin
  has been uploaded under multiple names. Here we just pick one.
  """
  filename: String,

  """Text of the readme file extracted from the skin"""
  readme_text: String,

  """Has the skin been flagged as "not safe for wrok"?"""
  nsfw: Boolean,

  """String representation (rgb usually) of the skin's average color"""
  average_color: String,

  """Has the skin been tweeted?"""
  tweeted: Boolean

  """List of @winampskins tweets that mentioned the skin."""
  tweets: [Tweet]

  """List of files contained within the skin's .wsz archive"""
  archive_files: [ArchiveFile]

  """The skin's "item" at archive.org"""
  internet_archive_item: InternetArchiveItem

  """
  Times that the skin has been reviewed either on the Museum's Tinder-style
  reivew page, or via the Discord bot.
  """
  reviews: [Review]
}


"""The judgement made about a skin by a moderator"""
enum Rating {
  APPROVED 
  REJECTED
  NSFW
}

"""
A review of a skin. Done either on the Museum's Tinder-style
reivew page, or via the Discord bot.
"""
type Review {
  """The skin that was reviewed"""
  skin: Skin

  """
  The user who made the review (if known). **Note:** In the early days we didn't
  track this, so many will be null.
  """
  reviewer: String

  """The rating that the user gave the skin"""
  rating: Rating
}


"""A file found within a Winamp Skin's .wsz archive"""
type ArchiveFile {
  """Filename of the file within the archive"""
  filename: String,

  """
  A URL to download the file. **Note:** This is powered by a little
  serverless Cloudflare function which tries to exctact the file on the fly.
  It may not work for all files.
  """
  url: String

  """
  The date on the file inside the archive. Given in simplified extended ISO
  format (ISO 8601).
  """
  date: String
  
}

"""A tweet made by @winampskins mentioning a Winamp skin"""
type Tweet {
  """
  URL of the tweet. **Note:** Early on in the bot's life we just recorded
  _which_ skins were tweeted, not any info about the actual tweet. This means we
  don't always know the URL of the tweet.
  """
  url: String

  """Number of likes the tweet has received. Updated nightly. (Note: Recent likes on older tweets may not be reflected here)"""
  likes: Int

  """Number of retweets the tweet has received. Updated nightly. (Note: Recent retweets on older tweets may not be reflected here)"""
  retweets: Int
  skin: Skin
}

type InternetArchiveItem {
  """The Internet Archive's unique identifier for this item"""
  identifier: String

  """The URL where this item can be viewed on the Internet Archive"""
  url: String

  """The skin that this item contains"""
  skin: Skin
}

"""A collection of tweets made by the @winampskins bot"""
type TweetsConnection {
  """The total number of tweets"""
  count: Int

  """The list of tweets"""
  nodes: [Tweet]
}

enum TweetsSortOption {
  LIKES
  RETWEETS
}

"""A collection of classic Winamp skins"""
type SkinsConnection {
  """The total number of skins matching the filter"""
  count: Int

  """The list of skins"""
  nodes: [Skin]
}

type User {
  username: String
}

enum SkinsSortOption {
  """
  the Museum's (https://skins.webamp.org) special sorting rules.

  Roughly speaking, it's:

  1. The four classic default skins
  2. Tweeted skins first (sorted by the number of likes/retweets)
  3. Approved, but not tweeted yet, skins
  4. Unreviwed skins
  5. Rejected skins
  6. NSFW skins
  """
  MUSEUM
}

enum SkinsFilterOption {
  """All the skins that have been approved for tweeting"""
  APPROVED
}

type Query {
  """The currently authenticated user, if any."""
  me: User

  """Get a skin by its MD5 hash"""
  fetch_skin_by_md5(md5: String!): Skin

  """Get a tweet by its URL"""
  fetch_tweet_by_url(url: String!): Tweet

  """
  All skins in the database

  **Note:** We don't currently support combining sorting and filtering.
  """
  skins(
    first: Int,
    offset: Int,
    sort: SkinsSortOption,
    filter: SkinsFilterOption
  ): SkinsConnection

  """
  Tweets tweeted by @winampskins
  """
  tweets(
    first: Int,
    offset: Int,
    sort: TweetsSortOption
  ): TweetsConnection
}`);

const root = {
  async fetch_skin_by_md5({ md5 }, { ctx }) {
    const skin = await SkinModel.fromMd5(ctx, md5);
    if (skin == null) {
      return null;
    }
    return new SkinResolver(skin);
  },
  async fetch_tweet_by_url({ url }, { ctx }) {
    const tweet = await TweetModel.fromAnything(ctx, url);
    if (tweet == null) {
      return null;
    }
    return new TweetResolver(tweet);
  },
  async skins({ first, offset, sort, filter }) {
    if (first > 1000) {
      throw new Error("Maximum limit is 1000");
    }
    return new SkinsConnection(first, offset, sort, filter);
  },
  async tweets({ first, offset, sort }) {
    if (first > 1000) {
      throw new Error("Maximum limit is 1000");
    }
    return new TweetsConnection(first, offset, sort);
  },
  me() {
    return new UserResolver();
  },
};

router.use(
  "/",
  graphqlHTTP({
    typeResolver(_type) {
      throw new Error("We probably need to implement typeResolver");
    },
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

export default router;
