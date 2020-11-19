import { Application } from "express";
import { knex } from "../../db";
import request from "supertest"; // supertest is a framework that allows to easily test web apis
import { createApp } from "../app";

let app: Application;
const handler = jest.fn();

beforeEach(async () => {
  handler.mockReset();
  // We ignore the ctx
  app = createApp((action, _ctx) => handler(action));
  await knex.migrate.latest();
  await knex.seed.run();
});

test("/skins/", async () => {
  const { body } = await request(app).get("/skins/"); //uses the request function that calls on express app instance
  expect(body).toEqual({
    skinCount: 4,
    skins: [
      { fileName: "path.wsz", md5: "a_fake_md5", nsfw: false },
      { fileName: "approved.wsz", md5: "an_approved_md5", nsfw: false },
      { fileName: "rejected.wsz", md5: "a_rejected_md5", nsfw: false },
      { fileName: "nsfw.wsz", md5: "a_nsfw_md5", nsfw: true },
    ],
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

test("/stylegan.json", async () => {
  let response = await request(app).get("/stylegan.json");
  expect(response.body).toEqual([
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
});
