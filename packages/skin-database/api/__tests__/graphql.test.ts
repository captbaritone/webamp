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

function gql(templateString: TemplateStringsArray): string {
  return templateString[0];
}

async function graphQLRequest(query: string, variables?: any) {
  const { body } = await request(app)
    .post("/graphql")
    .send({ query, variables: variables ?? {} });
  if (body.errors && body.errors.length) {
    for (const err of body.errors) {
      console.warn(err.message);
      console.warn("Stack", err.stack);
    }
  }

  return body;
}

test(".node", async () => {
  const { data } = await graphQLRequest(gql`
    query {
      skins(first: 1) {
        nodes {
          id
          md5
        }
      }
    }
  `);
  const skin = data.skins.nodes[0];
  expect(skin.id).toEqual("Q2xhc3NpY1NraW5fX2FfZmFrZV9tZDU=");

  const { data: data2 } = await graphQLRequest(
    gql`
      query MyQuery($id: ID!) {
        node(id: $id) {
          ... on Skin {
            md5
          }
        }
      }
    `,
    { id: skin.id }
  );
  expect(data2.node).toEqual({ md5: skin.md5 });
});

describe(".me", () => {
  test("logged in ", async () => {
    const { data } = await graphQLRequest(gql`
      query {
        me {
          username
        }
      }
    `);
    expect(data).toEqual({ me: { username: "<MOCKED>" } });
  });
  test("not logged in", async () => {
    username = undefined;
    const { data } = await graphQLRequest(gql`
      query {
        me {
          username
        }
      }
    `);
    expect(data).toEqual({ me: { username: null } });
  });
});

test.skip("/auth", async () => {
  const { body } = await request(app)
    .get("/auth")
    .expect(302)
    .expect(
      "Location",
      "https://discord.com/api/oauth2/authorize?client_id=%3CDUMMY_DISCORD_CLIENT_ID%3E&redirect_uri=https%3A%2F%2Fapi.webampskins.org%2Fauth%2Fdiscord&response_type=code&scope=identify%20guilds"
    );
  expect(body).toEqual({});
});

describe.skip("/auth/discord", () => {
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

describe("Query.skins", () => {
  test("no query params", async () => {
    const { data } = await graphQLRequest(
      gql`
        query {
          skins(sort: MUSEUM) {
            count
            nodes {
              ... on ClassicSkin {
                md5
                filename
                nsfw
              }
            }
          }
        }
      `
    );
    expect(data.skins).toMatchInlineSnapshot(`
      Object {
        "count": 6,
        "nodes": Array [
          Object {
            "filename": "tweeted.wsz",
            "md5": "a_tweeted_md5",
            "nsfw": false,
          },
          Object {
            "filename": "Zelda_Amp_3.wsz",
            "md5": "48bbdbbeb03d347e59b1eebda4d352d0",
            "nsfw": false,
          },
          Object {
            "filename": "path.wsz",
            "md5": "a_fake_md5",
            "nsfw": false,
          },
          Object {
            "filename": "approved.wsz",
            "md5": "an_approved_md5",
            "nsfw": false,
          },
          Object {
            "filename": "rejected.wsz",
            "md5": "a_rejected_md5",
            "nsfw": false,
          },
          Object {
            "filename": "nsfw.wsz",
            "md5": "a_nsfw_md5",
            "nsfw": true,
          },
        ],
      }
    `);
  });
  test("first and offset", async () => {
    const { data } = await graphQLRequest(
      gql`
        query MyQuery($first: Int, $offset: Int) {
          skins(first: $first, offset: $offset, sort: MUSEUM) {
            count
            nodes {
              ... on ClassicSkin {
                md5
                filename
                nsfw
              }
            }
          }
        }
      `,
      { first: 2, offset: 1 }
    );
    expect(data.skins).toMatchInlineSnapshot(`
      Object {
        "count": 6,
        "nodes": Array [
          Object {
            "filename": "Zelda_Amp_3.wsz",
            "md5": "48bbdbbeb03d347e59b1eebda4d352d0",
            "nsfw": false,
          },
          Object {
            "filename": "path.wsz",
            "md5": "a_fake_md5",
            "nsfw": false,
          },
        ],
      }
    `);
  });
});

test("Query.fetch_skin_by_md5 (debug data)", async () => {
  const { data } = await graphQLRequest(
    gql`
      query MyQuery($md5: String!) {
        fetch_skin_by_md5(md5: $md5) {
          ... on ClassicSkin {
            id
            md5
            museum_url
            webamp_url
            screenshot_url
            download_url
            filename
            readme_text
            nsfw
            average_color
            tweeted
            tweets {
              url
            }
            archive_files {
              filename
              url
              date
              file_md5
              size
              text_content
              is_directory
              skin {
                md5
              }
            }
            filename
            internet_archive_item {
              identifier
              url
              metadata_url
              raw_metadata_json
              skin {
                md5
              }
            }
            reviews {
              skin {
                md5
              }
              reviewer
              rating
            }
          }
        }
      }
    `,
    { md5: "a_fake_md5" }
  );
  expect(data).toMatchSnapshot();
});

test("Mutation.request_nsfw_review_for_skin", async () => {
  const { data } = await graphQLRequest(
    gql`
      mutation ($md5: String!) {
        request_nsfw_review_for_skin(md5: $md5)
      }
    `,
    { md5: "a_fake_md5" }
  );
  expect(handler).toHaveBeenCalledWith({
    type: "REVIEW_REQUESTED",
    md5: "a_fake_md5",
  });
  expect(data).toEqual({ request_nsfw_review_for_skin: true });
});

test("Mutation.approve_skin", async () => {
  const ctx = new UserContext();
  const { data } = await graphQLRequest(
    gql`
      mutation ($md5: String!) {
        approve_skin(md5: $md5)
      }
    `,
    { md5: "a_fake_md5" }
  );
  expect(handler).toHaveBeenCalledWith({
    type: "APPROVED_SKIN",
    md5: "a_fake_md5",
  });
  expect(data).toEqual({ approve_skin: true });
  const skin = await SkinModel.fromMd5(ctx, "a_fake_md5");

  expect(await skin?.getTweetStatus()).toEqual("APPROVED");
});

test("Mutation.reject_skin", async () => {
  const ctx = new UserContext();
  const { data } = await graphQLRequest(
    gql`
      mutation ($md5: String!) {
        reject_skin(md5: $md5)
      }
    `,
    { md5: "a_fake_md5" }
  );
  expect(handler).toHaveBeenCalledWith({
    type: "REJECTED_SKIN",
    md5: "a_fake_md5",
  });
  expect(data).toEqual({ reject_skin: true });
  const skin = await SkinModel.fromMd5(ctx, "a_fake_md5");

  expect(await skin?.getTweetStatus()).toEqual("REJECTED");
});

test("Mutation.mark_skin_nsfw", async () => {
  const ctx = new UserContext();
  const { data } = await graphQLRequest(
    gql`
      mutation ($md5: String!) {
        mark_skin_nsfw(md5: $md5)
      }
    `,
    { md5: "a_fake_md5" }
  );
  expect(handler).toHaveBeenCalledWith({
    type: "MARKED_SKIN_NSFW",
    md5: "a_fake_md5",
  });
  expect(searchIndex.partialUpdateObjects).toHaveBeenCalledWith([
    { nsfw: true, objectID: "a_fake_md5" },
  ]);
  expect(data).toEqual({ mark_skin_nsfw: true });
  const skin = await SkinModel.fromMd5(ctx, "a_fake_md5");

  expect(await skin?.getTweetStatus()).toEqual("NSFW");
});

describe("Query.skin_to_review", () => {
  test("logged in ", async () => {
    const { data } = await graphQLRequest(
      gql`
        query {
          skin_to_review {
            md5
            filename
          }
        }
      `
    );

    expect(data).toEqual({
      skin_to_review: {
        filename: expect.any(String),
        md5: expect.any(String),
      },
    });
  });
  test("not logged in ", async () => {
    username = undefined;
    const { data } = await graphQLRequest(
      gql`
        query {
          skin_to_review {
            md5
            filename
          }
        }
      `
    );
    expect(data).toEqual({ skin_to_review: null });
  });
});

// TODO: Actually upload some skins?
test("Query.upload_statuses_by_md5", async () => {
  const { data } = await graphQLRequest(
    gql`
      query ($md5s: [String!]!) {
        upload_statuses_by_md5(md5s: $md5s) {
          id
          status
          upload_md5
        }
      }
    `,
    { md5s: ["a_fake_md5", "a_missing_md5"] }
  );
  expect(data.upload_statuses_by_md5).toEqual([]);
});

test("Mutation.upload.get_upload_urls", async () => {
  const { data } = await graphQLRequest(
    gql`
      mutation ($files: [UploadUrlRequest!]!) {
        upload {
          get_upload_urls(files: $files) {
            id
            url
            md5
          }
        }
      }
    `,
    {
      files: [
        {
          md5: "3b73bcd43c30b85d4cad3083e8ac9695",
          filename: "a_fake_new_file.wsz",
        },
        {
          md5: "48bbdbbeb03d347e59b1eebda4d352d0",
          filename: "a_new_name_for_a_file_that_exists.wsz",
        },
      ],
    }
  );

  expect(S3.getSkinUploadUrl).toHaveBeenCalledWith(
    "3b73bcd43c30b85d4cad3083e8ac9695",
    expect.any(Number)
  );

  expect(data.upload.get_upload_urls).toEqual([
    {
      md5: "3b73bcd43c30b85d4cad3083e8ac9695",
      id: expect.any(String),
      url: "<MOCK_S3_UPLOAD_URL>",
    },
  ]);
});

test("An Upload Flow", async () => {
  // Request an upload URL
  const md5 = "3b73bcd43c30b85d4cad3083e8ac9695";
  const filename = "a_fake_new_file.wsz";
  const { data } = await graphQLRequest(
    gql`
      mutation ($files: [UploadUrlRequest!]!) {
        upload {
          get_upload_urls(files: $files) {
            id
            url
            md5
          }
        }
      }
    `,
    { files: [{ md5, filename }] }
  );

  expect(data.upload.get_upload_urls).toEqual([
    {
      md5,
      id: expect.any(String),
      url: "<MOCK_S3_UPLOAD_URL>",
    },
  ]);

  const id = data.upload.get_upload_urls[0].id;

  const requestedUpload = await knex("skin_uploads").where({ id }).first();
  expect(requestedUpload).toEqual({
    filename,
    id: Number(id),
    skin_md5: md5,
    status: "URL_REQUESTED",
  });

  // Report that we've uploaded the skin to S3 (we lie)
  const { data: uploadReportData } = await graphQLRequest(
    gql`
      mutation ($id: String!, $md5: String!) {
        upload {
          report_skin_uploaded(id: $id, md5: $md5)
        }
      }
    `,
    { md5, id }
  );
  expect(uploadReportData.upload.report_skin_uploaded).toEqual(true);
  expect(processUserUploads).toHaveBeenCalled();

  const reportedUpload = await knex("skin_uploads").where({ id }).first();
  expect(reportedUpload).toEqual({
    filename,
    id: Number(id),
    skin_md5: md5,
    status: "UPLOAD_REPORTED",
  });
});
