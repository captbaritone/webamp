import path from "path";
import UserContext from "../../data/UserContext";
import { knex } from "../../db";
import { getSkinsToRefresh, refresh } from "../refresh";
import SkinModel from "../../data/SkinModel";
import fs from "fs";
import Shooter from "../../shooter";

jest.mock("../../algolia");
jest.mock("../../s3");
jest.mock("../screenshotSkin");
jest.mock("node-fetch", () => jest.fn());

// @ts-ignore
const shooter: Shooter = {};

beforeEach(async () => {
  await knex.migrate.latest();
  await knex.seed.run();
});

test("refresh", async () => {
  const ctx = new UserContext();
  const [skin] = await getSkinsToRefresh(ctx, 1);
  expect(skin.getMd5()).toEqual("a_fake_md5");

  skin.getBuffer = async () => Buffer.from("");

  const originalConsoleError = console.error;
  console.error = jest.fn();
  await refresh(skin, shooter);
  console.error = originalConsoleError;

  const [nextToRefresh] = await getSkinsToRefresh(ctx, 1);
  expect(nextToRefresh.getMd5()).not.toEqual("a_fake_md5");
});

test("can't extract", async () => {
  const originalConsoleError = console.error;
  console.error = jest.fn();
  const ctx = new UserContext();
  const skin = await SkinModel.fromMd5Assert(ctx, "a_fake_md5");
  skin.getBuffer = async () => Buffer.from("");

  await refresh(skin, shooter);
  const refreshRow = await knex("refreshes")
    .where("skin_md5", skin.getMd5())
    .first();
  expect(refreshRow).toEqual({
    error:
      "End of data reached (data length = 0, asked index = 4). Corrupted zip ?",
    skin_md5: "a_fake_md5",
    id: expect.any(Number),
    timestamp: expect.stringMatching(/^[0-9]{4}-/),
  });
  console.error = originalConsoleError;
});

// TODO: Turn back on once dates are stable in output
test.skip("valid skin (TopazAmp)", async () => {
  const ctx = new UserContext();
  const skin = await SkinModel.fromMd5Assert(ctx, "a_fake_md5");

  skin.getBuffer = async () => {
    return fs.readFileSync(
      path.join(__dirname, "../../../webamp/demo/skins/TopazAmp1-2.wsz")
    );
  };

  await refresh(skin, shooter);

  // Check that it set the archive files
  const archiveFiles = await skin.getArchiveFiles();

  // Check archive file
  expect(
    await Promise.all(archiveFiles.map((file) => file.debug()))
  ).toMatchSnapshot();

  // Check readme
  const skinRow = await knex("skins").where("md5", skin.getMd5()).first();
  expect(skinRow.readme_text).toMatchSnapshot();
  expect(skinRow.skin_type).toBe(1);

  // Check Refresh
  const refreshRow = await knex("refreshes")
    .where("skin_md5", skin.getMd5())
    .first();
  expect(refreshRow).toEqual({
    error: null,
    skin_md5: "a_fake_md5",
    id: expect.any(Number),
    timestamp: expect.stringMatching(/^[0-9]{4}-/),
  });
});
