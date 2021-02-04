import { knex } from "../../db";
import * as Skins from "../skins";
import TweetModel from "../TweetModel";
import UserContext from "../UserContext";

beforeEach(async () => {
  await knex.migrate.latest();
});

test("empty", async () => {
  expect(await Skins.getAllClassicSkins()).toEqual([]);
  expect(await Skins.getClassicSkinCount()).toBe(0);
  expect(await Skins.getTweetableSkinCount()).toBe(0);
  expect(await Skins.getAllClassicScreenshotUrls()).toEqual([]);
  expect(await Skins.getMuseumPage({ offset: 0, first: 10 })).toEqual([]);
  expect(await Skins.getStats()).toEqual({
    approved: 0,
    rejected: 0,
    nsfw: 0,
    tweeted: 0,
    tweetable: 0,
    webUploads: 0,
    uploadsAwaitingProcessing: 0,
    uploadsErrored: 0,
  });

  expect(await Skins.getSkinToTweet()).toBe(null);
  expect(Skins.getSkinToReview()).rejects.toThrow(
    "Could not find any skins to review"
  );
  expect(await Skins.getReportedUpload()).toBe(null);
  expect(await Skins.getSkinsToShoot(1000)).toEqual([]);
  expect(await Skins.getUploadStatuses([])).toEqual({});
});

describe("seeded", () => {
  beforeEach(async () => {
    await knex.seed.run();
  });
  test("getAllClassicSkins", async () => {
    expect(await Skins.getAllClassicSkins()).toMatchInlineSnapshot(`
      Array [
        Object {
          "fileName": "Zelda_Amp_3.wsz",
          "md5": "48bbdbbeb03d347e59b1eebda4d352d0",
        },
        Object {
          "fileName": "path.wsz",
          "md5": "a_fake_md5",
        },
        Object {
          "fileName": "nsfw.wsz",
          "md5": "a_nsfw_md5",
        },
        Object {
          "fileName": "rejected.wsz",
          "md5": "a_rejected_md5",
        },
        Object {
          "fileName": "tweeted.wsz",
          "md5": "a_tweeted_md5",
        },
        Object {
          "fileName": "approved.wsz",
          "md5": "an_approved_md5",
        },
      ]
    `);
  });
  test("getClassicSkinCount", async () => {
    expect(await Skins.getClassicSkinCount()).toBe(6);
  });
  test("getTweetableSkinCount", async () => {
    expect(await Skins.getTweetableSkinCount()).toBe(1);
  });
  test("getAllClassicScreenshotUrls", async () => {
    expect(await Skins.getAllClassicScreenshotUrls()).toMatchInlineSnapshot(`
      Array [
        Object {
          "fileName": "Zelda_Amp_3.wsz",
          "url": "https://cdn.webampskins.org/screenshots/48bbdbbeb03d347e59b1eebda4d352d0.png",
        },
        Object {
          "fileName": "path.wsz",
          "url": "https://cdn.webampskins.org/screenshots/a_fake_md5.png",
        },
        Object {
          "fileName": "nsfw.wsz",
          "url": "https://cdn.webampskins.org/screenshots/a_nsfw_md5.png",
        },
        Object {
          "fileName": "rejected.wsz",
          "url": "https://cdn.webampskins.org/screenshots/a_rejected_md5.png",
        },
        Object {
          "fileName": "tweeted.wsz",
          "url": "https://cdn.webampskins.org/screenshots/a_tweeted_md5.png",
        },
        Object {
          "fileName": "approved.wsz",
          "url": "https://cdn.webampskins.org/screenshots/an_approved_md5.png",
        },
      ]
    `);
  });
  test("getMuseumPage", async () => {
    expect(await Skins.getMuseumPage({ offset: 0, first: 10 }))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "fileName": "Zelda_Amp_3.wsz",
          "md5": "48bbdbbeb03d347e59b1eebda4d352d0",
          "nsfw": false,
        },
        Object {
          "fileName": "path.wsz",
          "md5": "a_fake_md5",
          "nsfw": false,
        },
        Object {
          "fileName": "tweeted.wsz",
          "md5": "a_tweeted_md5",
          "nsfw": false,
        },
        Object {
          "fileName": "approved.wsz",
          "md5": "an_approved_md5",
          "nsfw": false,
        },
        Object {
          "fileName": "rejected.wsz",
          "md5": "a_rejected_md5",
          "nsfw": false,
        },
        Object {
          "fileName": "nsfw.wsz",
          "md5": "a_nsfw_md5",
          "nsfw": true,
        },
      ]
    `);
  });
  test("getMuseumPage does not include skins with errors", async () => {
    await knex("refreshes").insert({
      skin_md5: "48bbdbbeb03d347e59b1eebda4d352d0",
      error: "Whoops",
    });
    const page = await Skins.getMuseumPage({ offset: 0, first: 10 });
    const hasZelda = page.some(
      (skin) => skin.md5 === "48bbdbbeb03d347e59b1eebda4d352d0"
    );
    expect(hasZelda).toBe(false);
  });
  test("getStats", async () => {
    expect(await Skins.getStats()).toMatchInlineSnapshot(`
      Object {
        "approved": 2,
        "nsfw": 1,
        "rejected": 1,
        "tweetable": 1,
        "tweeted": 1,
        "uploadsAwaitingProcessing": 0,
        "uploadsErrored": 0,
        "webUploads": 0,
      }
    `);
  });
  test("getSkinToTweet", async () => {
    expect(await Skins.getSkinToTweet()).toEqual({
      canonicalFilename: "approved.wsz",
      md5: "an_approved_md5",
    });
  });
  test("getSkinToTweet does not include skins with errors", async () => {
    await knex("refreshes").insert({
      skin_md5: "an_approved_md5",
      error: "Whoops",
    });
    expect(await Skins.getSkinToTweet()).toBe(null);
  });
  test("getSkinToReview", async () => {
    expect(Skins.getSkinToReview()).resolves.toEqual({
      filename: expect.any(String),
      md5: expect.any(String),
    });
  });
  test("getReportedUpload", async () => {
    expect(await Skins.getReportedUpload()).toBe(null);
  });
  test("getSkinsToShoot", async () => {
    expect(await Skins.getSkinsToShoot(1)).toEqual([
      "48bbdbbeb03d347e59b1eebda4d352d0",
    ]);
  });
  test("getUploadStatuses", async () => {
    expect(await Skins.getUploadStatuses([])).toEqual({});
  });

  describe("setTweetInfo", () => {
    test("update", async () => {
      const ctx = new UserContext();
      const md5 = "a_tweeted_md5";
      const likes = 420;
      const retweets = 69;
      const tweetId = "1333893671326871552";
      expect(await Skins.setTweetInfo(md5, likes, retweets, tweetId)).toBe(
        true
      );
      const tweet = await TweetModel.fromTweetId(ctx, "1333893671326871552");
      expect(tweet?.getLikes()).toBe(420);
      expect(tweet?.getRetweets()).toBe(69);
    });

    test("insert", async () => {
      const ctx = new UserContext();
      const md5 = "a_fake_md5";
      const likes = 1;
      const retweets = 2;
      const tweetId = "12345";
      expect(await Skins.setTweetInfo(md5, likes, retweets, tweetId)).toBe(
        true
      );
      const tweet = await TweetModel.fromTweetId(ctx, "12345");
      expect(tweet?.getLikes()).toBe(1);
      expect(tweet?.getRetweets()).toBe(2);
    });

    test("insert without an md5 returns false and does not write", async () => {
      const ctx = new UserContext();
      const md5 = null;
      const likes = 1;
      const retweets = 2;
      const tweetId = "12345";
      expect(await Skins.setTweetInfo(md5, likes, retweets, tweetId)).toBe(
        false
      );
      const tweet = await TweetModel.fromTweetId(ctx, "12345");
      expect(tweet).toBe(null);
    });
  });
});
