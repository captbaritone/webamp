import { knex } from "../../db";
import SkinModel from "../SkinModel";
import UserContext from "../UserContext";

beforeEach(async () => {
  await knex.migrate.latest();
  await knex.seed.run();
});

test("fromMd5", async () => {
  const ctx = new UserContext();
  const skin = await SkinModel.fromMd5(ctx, "a_fake_md5");
  expect(skin?.getMd5()).toBe("a_fake_md5");
});

describe("fromAnything", () => {
  test("md5", async () => {
    const ctx = new UserContext();
    const skin = await SkinModel.fromAnything(
      ctx,
      "48bbdbbeb03d347e59b1eebda4d352d0"
    );
    expect(skin?.getMd5()).toBe("48bbdbbeb03d347e59b1eebda4d352d0");
  });
});
