import { Application } from "express";
import { knex } from "../../db";
import request from "supertest"; // supertest is a framework that allows to easily test web apis
import { createApp } from "../app";
import SkinModel from "../../data/SkinModel";
import * as S3 from "../../s3";
import * as Auth from "../auth";
import { processUserUploads } from "../processUserUploads";
import UserContext from "../../data/UserContext";
import { searchIndex } from "../../algolia";
jest.mock("../../s3");
jest.mock("../../algolia");
jest.mock("../processUserUploads");
jest.mock("../auth");

let app: Application;
const handler = jest.fn();
const log = jest.fn();
const logError = jest.fn();

let username: string | undefined;

beforeEach(async () => {
  jest.clearAllMocks();
  username = "<MOCKED>";
  app = createApp({
    eventHandler: handler,
    extraMiddleware: (req, res, next) => {
      req.session.username = username;
      next();
    },
    logger: { log, logError },
  });
  await knex.migrate.latest();
  await knex.seed.run();
});

describe("/authed", () => {
  test("logged in ", async () => {
    const { body } = await request(app).get("/authed").expect(200);
    expect(body).toEqual({ username: "<MOCKED>" });
  });
  test("not logged in", async () => {
    username = undefined;
    const { body } = await request(app).get("/authed").expect(200);
    expect(body).toEqual({ username: null });
  });
});

test("/auth", async () => {
  const { body } = await request(app)
    .get("/auth")
    .expect(302)
    .expect(
      "Location",
      "https://discord.com/api/oauth2/authorize?client_id=560264562222432304&redirect_uri=https%3A%2F%2Fapi.webampskins.org%2Fauth%2Fdiscord&response_type=code&scope=identify%20guilds"
    );
  expect(body).toEqual({});
});

describe("/auth/discord", () => {
  test("valid code", async () => {
    const response = await request(app)
      .get("/auth/discord")
      .query({ code: "<A_FAKE_CODE>" })
      .expect(302)
      .expect("Location", "https://skins.webamp.org/review/");
    // TODO: Assert that we get cookie headers. I think that will not work now
    // because express does not think it's secure in a test env.
    expect(Auth.auth).toHaveBeenCalledWith("<A_FAKE_CODE>");
    expect(response.body).toEqual({});
  });
  test("missing code", async () => {
    const { body } = await request(app).get("/auth/discord").expect(400);
    expect(Auth.auth).not.toHaveBeenCalled();
    expect(body).toEqual({ message: "Expected to get a code" });
  });
});

describe("/skins/", () => {
  test("no query params", async () => {
    const { body } = await request(app).get("/skins/");
    expect(body).toMatchInlineSnapshot(`
      Object {
        "skinCount": 6,
        "skins": Array [
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
        ],
      }
    `);
  });
  test("first and offset", async () => {
    const { body } = await request(app)
      .get("/skins/")
      .query({ first: 2, offset: 1 });
    expect(body).toMatchInlineSnapshot(`
      Object {
        "skinCount": 6,
        "skins": Array [
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
        ],
      }
    `);
  });
});

test("/skins/a_fake_md5/debug", async () => {
  const { body } = await request(app)
    .get("/skins/a_fake_md5/debug")
    .expect(200);
  expect(body).toMatchSnapshot();
});

test("/skins/a_fake_md5/report", async () => {
  const { body } = await request(app)
    .post("/skins/a_fake_md5/report")
    .expect(200);
  expect(handler).toHaveBeenCalledWith({
    type: "REVIEW_REQUESTED",
    md5: "a_fake_md5",
  });
  expect(body).toEqual({}); // TODO: Where does the text response go?
});

test("/skins/a_fake_md5/approve", async () => {
  const ctx = new UserContext();
  const { body } = await request(app)
    .post("/skins/a_fake_md5/approve")
    .expect(200);
  expect(handler).toHaveBeenCalledWith({
    type: "APPROVED_SKIN",
    md5: "a_fake_md5",
  });
  expect(body).toEqual({ message: "The skin has been approved." });
  const skin = await SkinModel.fromMd5(ctx, "a_fake_md5");

  expect(await skin?.getTweetStatus()).toEqual("APPROVED");
});

describe("/to_review", () => {
  test("logged in ", async () => {
    const { body } = await request(app).get("/to_review").expect(200);

    expect(body).toEqual({
      filename: expect.any(String),
      md5: expect.any(String),
    });
  });
  test("not logged in ", async () => {
    username = undefined;
    const { body } = await request(app).get("/to_review").expect(403);
    expect(body).toEqual({ message: "You must be logged in" });
  });
});

test("/skins/a_md5_that_does_not_exist/approve (404)", async () => {
  const { body } = await request(app)
    .post("/skins/a_md5_that_does_not_exist/approve")
    .expect(404);

  expect(body).toEqual({});
  expect(handler).not.toHaveBeenCalled();
});

test("/skins/a_fake_md5/reject", async () => {
  const ctx = new UserContext();
  const { body } = await request(app)
    .post("/skins/a_fake_md5/reject")
    .expect(200);
  expect(handler).toHaveBeenCalledWith({
    type: "REJECTED_SKIN",
    md5: "a_fake_md5",
  });
  expect(body).toEqual({ message: "The skin has been rejected." }); // TODO: Where does the text response go?
  const skin = await SkinModel.fromMd5(ctx, "a_fake_md5");

  expect(await skin?.getTweetStatus()).toEqual("REJECTED");
});

test("/skins/a_md5_that_does_not_exist/reject (404)", async () => {
  const { body } = await request(app)
    .post("/skins/a_md5_that_does_not_exist/reject")
    .expect(404);

  expect(body).toEqual({});
  expect(handler).not.toHaveBeenCalled();
});

test("/skins/a_fake_md5/nsfw", async () => {
  const ctx = new UserContext();
  const { body } = await request(app)
    .post("/skins/a_fake_md5/nsfw")
    .expect(200);
  expect(handler).toHaveBeenCalledWith({
    type: "MARKED_SKIN_NSFW",
    md5: "a_fake_md5",
  });
  expect(searchIndex.partialUpdateObjects).toHaveBeenCalledWith([
    { nsfw: true, objectID: "a_fake_md5" },
  ]);
  expect(body).toEqual({ message: "The skin has been marked as NSFW." });
  const skin = await SkinModel.fromMd5(ctx, "a_fake_md5");

  expect(await skin?.getTweetStatus()).toEqual("NSFW");
});

// TODO: Actually upload some skins?
test("/skins/status", async () => {
  const { body } = await request(app)
    .post("/skins/status")
    .send({ hashes: ["a_fake_md5", "a_missing_md5"] });
  expect(body).toEqual({});
});

test("/approved", async () => {
  const { body } = await request(app).get("/approved").expect(200);
  expect(body).toEqual(["an_approved_md5", "a_tweeted_md5"]);
});

test("/skins/a_fake_md5", async () => {
  let response = await request(app).get("/skins/a_fake_md5");
  expect(response.body).toEqual({
    fileName: "path.wsz",
    md5: "a_fake_md5",
    nsfw: false,
  });
  response = await request(app).get("/skins/a_nsfw_md5");
  expect(response.body).toEqual({
    fileName: "nsfw.wsz",
    md5: "a_nsfw_md5",
    nsfw: true,
  });
  await request(app).get("/skins/does_not_exist_md5").expect(404);
});

test("/skins/get_upload_urls", async () => {
  const { body } = await request(app)
    .post("/skins/get_upload_urls")
    .send({
      skins: {
        "3b73bcd43c30b85d4cad3083e8ac9695": "a_fake_new_file.wsz",
        "48bbdbbeb03d347e59b1eebda4d352d0":
          "a_new_name_for_a_file_that_exists.wsz",
      },
    });

  expect(S3.getSkinUploadUrl).toHaveBeenCalledWith(
    "3b73bcd43c30b85d4cad3083e8ac9695",
    expect.any(Number)
  );

  expect(body).toEqual({
    "3b73bcd43c30b85d4cad3083e8ac9695": {
      id: expect.any(Number),
      url: "<MOCK_S3_UPLOAD_URL>",
    },
  });
});

test("An Upload Flow", async () => {
  // Request an upload URL
  const md5 = "3b73bcd43c30b85d4cad3083e8ac9695";
  const filename = "a_fake_new_file.wsz";
  const skins = { [md5]: filename };
  const getUrlsResponse = await request(app)
    .post("/skins/get_upload_urls")
    .send({ skins });

  const id = getUrlsResponse.body[md5].id;

  expect(getUrlsResponse.body).toEqual({
    [md5]: { id: expect.any(Number), url: "<MOCK_S3_UPLOAD_URL>" },
  });

  const requestedUpload = await knex("skin_uploads").where({ id }).first();
  expect(requestedUpload).toEqual({
    filename,
    id,
    skin_md5: md5,
    status: "URL_REQUESTED",
  });

  // Report that we've uploaded the skin to S3 (we lie)
  const uploadedResponse = await request(app)
    .post(`/skins/${md5}/uploaded`)
    .query({ id })
    .send({ skins });
  expect(uploadedResponse.body).toEqual({ done: true });
  expect(processUserUploads).toHaveBeenCalled();

  const reportedUpload = await knex("skin_uploads").where({ id }).first();
  expect(reportedUpload).toEqual({
    filename,
    id,
    skin_md5: md5,
    status: "UPLOAD_REPORTED",
  });
});

test("/stylegan.json", async () => {
  const response = await request(app).get("/stylegan.json");
  expect(response.body).toMatchInlineSnapshot(`
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
