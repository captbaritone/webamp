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
  expect(files[0].getFileDate().getTime()).toEqual(
    new Date("1995-12-17T03:24:00").getTime()
  );
});
