import { knex } from "../../db";
import * as Skins from "../skins";

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
  });

  expect(await Skins.getSkinToTweet()).toBe(null);
  expect(Skins.getSkinToReview()).rejects.toThrow(
    "Could not find any skins to review"
  );
  expect(await Skins.getReportedUpload()).toBe(null);
  expect(await Skins.getSkinToShoot()).toBe(null);
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
          "fileName": "approved.wsz",
          "md5": "an_approved_md5",
        },
      ]
    `);
  });
  test("getClassicSkinCount", async () => {
    expect(await Skins.getClassicSkinCount()).toBe(5);
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
  test("getStats", async () => {
    expect(await Skins.getStats()).toEqual({
      approved: 1,
      rejected: 1,
      nsfw: 1,
      tweeted: 0,
      tweetable: 1,
      webUploads: 0,
    });
  });
  test("getSkinToTweet", async () => {
    expect(await Skins.getSkinToTweet()).toEqual({
      canonicalFilename: "approved.wsz",
      md5: "an_approved_md5",
    });
  });
  test("getSkinToReview", async () => {
    expect(Skins.getSkinToReview()).rejects.toThrow(
      "Could not find any skins to review"
    );
  });
  test("getReportedUpload", async () => {
    expect(await Skins.getReportedUpload()).toBe(null);
  });
  test("getSkinToShoot", async () => {
    expect(await Skins.getSkinToShoot()).toBe(
      "48bbdbbeb03d347e59b1eebda4d352d0"
    );
  });
  test("getUploadStatuses", async () => {
    expect(await Skins.getUploadStatuses([])).toEqual({});
  });
});
