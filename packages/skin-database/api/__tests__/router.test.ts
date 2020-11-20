import { Application } from "express";
import { knex } from "../../db";
import request from "supertest"; // supertest is a framework that allows to easily test web apis
import { createApp } from "../app";
import * as S3 from "../../s3";
jest.mock("../../s3");
jest.mock("../processUserUploads");

let app: Application;
const handler = jest.fn();

beforeEach(async () => {
  handler.mockReset();
  // We ignore the ctx
  app = createApp((action, _ctx) => handler(action));
  await knex.migrate.latest();
  await knex.seed.run();
});

describe("/skins/", () => {
  test("no query params", async () => {
    const { body } = await request(app).get("/skins/");
    expect(body).toMatchInlineSnapshot(`
      Object {
        "skinCount": 5,
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
        "skinCount": 5,
        "skins": Array [
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
        ],
      }
    `);
  });
});

test("/skins/a_fake_md5/report", async () => {
  const { body } = await request(app).post("/skins/a_fake_md5/report");
  expect(handler).toHaveBeenCalledWith({
    type: "REVIEW_REQUESTED",
    md5: "a_fake_md5",
  });
  expect(body).toEqual({}); // TODO: Where does the text response go?
});

// TODO: Actually upload some skins?
test("/skins/status", async () => {
  const { body } = await request(app)
    .post("/skins/status")
    .send({ hashes: ["a_fake_md5", "a_missing_md5"] });
  expect(body).toEqual({});
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
  const md5 = "3b73bcd43c30b85d4cad3083e8ac9695";
  const skins = { [md5]: "a_fake_new_file.wsz" };
  const getUrlsResponse = await request(app)
    .post("/skins/get_upload_urls")
    .send({ skins });

  const id = getUrlsResponse.body[md5].id;

  expect(getUrlsResponse.body).toEqual({
    [md5]: { id: expect.any(Number), url: "<MOCK_S3_UPLOAD_URL>" },
  });

  const uploadedResponse = await request(app)
    .post(`/skins/${md5}/uploaded`)
    .query({ id })
    .send({ skins });
  expect(uploadedResponse.body).toEqual({ done: true });
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
        "fileName": "approved.wsz",
        "url": "https://cdn.webampskins.org/screenshots/an_approved_md5.png",
      },
    ]
  `);
});
