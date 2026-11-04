import { knex } from "../../db";
import * as IAService from "../../services/internetArchive";
import { pickIdentifier } from "../syncToArchive";

jest.mock("../../services/internetArchive");

const MD5 = "a".repeat(32);
const OTHER_MD5 = "b".repeat(32);

// The archive's items, by exact identifier.
let items: Record<string, { files: Array<{ name: string; md5: string }> }>;

beforeEach(async () => {
  await knex.migrate.latest();
  await knex("ia_items").del();
  items = {};
  jest
    .mocked(IAService.itemMetadata)
    .mockImplementation(async (identifier) => items[identifier] ?? {});
});

afterAll(async () => {
  await knex.destroy();
});

test("uses the skin's name when it's free", async () => {
  expect(await pickIdentifier("CalAmp.wsz", MD5)).toEqual({
    identifier: "winampskins_CalAmp",
    holdsSkin: false,
  });
});

test("counts past identifiers taken here, in any case, or on the archive", async () => {
  await knex("ia_items").insert({
    skin_md5: OTHER_MD5,
    identifier: "winampskins_calamp",
  });
  items.winampskins_CalAmp_1 = {
    files: [{ name: "CalAmp.wsz", md5: OTHER_MD5 }],
  };
  expect(await pickIdentifier("CalAmp.wsz", MD5)).toEqual({
    identifier: "winampskins_CalAmp_2",
    holdsSkin: false,
  });
});

test("skips identifiers the archive refused", async () => {
  const rejected = new Set(["winampskins_CalAmp", "winampskins_CalAmp_1"]);
  expect((await pickIdentifier("CalAmp.wsz", MD5, rejected)).identifier).toBe(
    "winampskins_CalAmp_2"
  );
});

test("finds an earlier upload of the same skin we never recorded", async () => {
  items.winampskins_CalAmp = {
    files: [{ name: "CalAmp.wsz", md5: OTHER_MD5 }],
  };
  items.winampskins_CalAmp_1 = {
    files: [
      { name: "CalAmp.wsz", md5: MD5 },
      { name: "CalAmp_files.xml", md5: "c".repeat(32) },
    ],
  };
  expect(await pickIdentifier("CalAmp.wsz", MD5)).toEqual({
    identifier: "winampskins_CalAmp_1",
    holdsSkin: true,
  });
});
