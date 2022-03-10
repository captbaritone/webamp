import { knex } from "../../db";
import ArchiveFileModel from "../ArchiveFileModel";
import UserContext from "../UserContext";

beforeEach(async () => {
  await knex.migrate.latest();
  await knex.seed.run();
});

test("fromMd5", async () => {
  const ctx = new UserContext();
  const files = await ArchiveFileModel.fromMd5(ctx, "a_fake_md5");
  expect(files.length).toEqual(1);
  expect(files[0].getFileDate().getTime()).toEqual(957771892000);
});
