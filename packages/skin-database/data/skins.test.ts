import * as Skins from "./skins";
import { db } from "../db";

afterAll(() => {
  db.close();
});

test("getSkinToReview", async () => {
  const { md5, filename } = await Skins.getSkinToReview();
  expect(md5.length).toBe(32);
  expect(typeof filename).toBe("string");
  const skin = await Skins.getSkinByMd5(md5);
  expect(skin?.tweetStatus).toBe("UNREVIEWED");
});

test("getSkinToReviewForNsfw", async () => {
  const { md5, filename } = await Skins.getSkinToReviewForNsfw();
  expect(md5.length).toBe(32);
  expect(typeof filename).toBe("string");
});

test("getClassicSkinCount", async () => {
  const count = await Skins.getClassicSkinCount();
  expect(count > 60000).toBe(true);
});
