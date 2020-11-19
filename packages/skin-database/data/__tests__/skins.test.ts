import { knex } from "../../db";
import * as Skins from "../skins";

beforeEach(async () => {
  await knex.migrate.latest();
});

describe("empty", () => {
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
});

describe("seeded", () => {
  beforeEach(async () => {
    await knex.seed.run();
  });
  test("empty", async () => {
    expect(await Skins.getAllClassicSkins()).toEqual([
      { fileName: "path.wsz", md5: "a_fake_md5" },
      { fileName: "nsfw.wsz", md5: "a_nsfw_md5" },
      { fileName: "rejected.wsz", md5: "a_rejected_md5" },
      { fileName: "approved.wsz", md5: "an_approved_md5" },
    ]);
    expect(await Skins.getClassicSkinCount()).toBe(4);
    expect(await Skins.getTweetableSkinCount()).toBe(1);
    expect(await Skins.getAllClassicScreenshotUrls()).toEqual([
      {
        fileName: "path.wsz",
        url: "https://cdn.webampskins.org/screenshots/a_fake_md5.png",
      },
      {
        fileName: "nsfw.wsz",
        url: "https://cdn.webampskins.org/screenshots/a_nsfw_md5.png",
      },
      {
        fileName: "rejected.wsz",
        url: "https://cdn.webampskins.org/screenshots/a_rejected_md5.png",
      },
      {
        fileName: "approved.wsz",
        url: "https://cdn.webampskins.org/screenshots/an_approved_md5.png",
      },
    ]);
    expect(await Skins.getMuseumPage({ offset: 0, first: 10 })).toEqual([
      {
        fileName: "path.wsz",
        md5: "a_fake_md5",
        nsfw: false,
      },
      {
        fileName: "approved.wsz",
        md5: "an_approved_md5",
        nsfw: false,
      },
      {
        fileName: "rejected.wsz",
        md5: "a_rejected_md5",
        nsfw: false,
      },
      {
        fileName: "nsfw.wsz",
        md5: "a_nsfw_md5",
        nsfw: true,
      },
    ]);
    expect(await Skins.getStats()).toEqual({
      approved: 1,
      rejected: 1,
      nsfw: 1,
      tweeted: 0,
      tweetable: 1,
      webUploads: 0,
    });

    expect(await Skins.getSkinToTweet()).toEqual({
      canonicalFilename: "approved.wsz",
      md5: "an_approved_md5",
    });
    expect(Skins.getSkinToReview()).rejects.toThrow(
      "Could not find any skins to review"
    );
    expect(await Skins.getReportedUpload()).toBe(null);
    expect(await Skins.getSkinToShoot()).toBe("a_fake_md5");
    expect(await Skins.getUploadStatuses([])).toEqual({});
  });
});
