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
  test("Skin Museuem URL", async () => {
    const ctx = new UserContext();
    const skin = await SkinModel.fromAnything(
      ctx,
      "https://skins.webamp.org/skin/48bbdbbeb03d347e59b1eebda4d352d0/MountainDew.wsz/"
    );
    expect(skin?.getMd5()).toBe("48bbdbbeb03d347e59b1eebda4d352d0");
  });
  test("Webamp URL", async () => {
    const ctx = new UserContext();
    const skin = await SkinModel.fromAnything(
      ctx,
      "https://webamp.org/?skinUrl=https://cdn.webampskins.org/skins/48bbdbbeb03d347e59b1eebda4d352d0.wsz"
    );
    expect(skin?.getMd5()).toBe("48bbdbbeb03d347e59b1eebda4d352d0");
  });
  test("Internet Archive Item identifier", async () => {
    const ctx = new UserContext();
    const skin = await SkinModel.fromAnything(ctx, "a_fake_ia_identifier");
    expect(skin?.getMd5()).toBe("a_fake_md5");
  });
  test("Internet Archive Item identifier", async () => {
    const ctx = new UserContext();
    const skin = await SkinModel.fromAnything(
      ctx,
      "https://archive.org/details/a_fake_ia_identifier"
    );
    expect(skin?.getMd5()).toBe("a_fake_md5");
  });
  test("Tweet URL", async () => {
    const ctx = new UserContext();
    const skin = await SkinModel.fromAnything(
      ctx,
      "https://twitter.com/winampskins/status/1333893671326871552"
    );
    expect(skin?.getMd5()).toBe("a_tweeted_md5");
  });
});
