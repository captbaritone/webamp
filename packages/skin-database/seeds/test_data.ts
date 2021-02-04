import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
  // Deletes ALL existing entries
  await knex("skins").del();
  await knex("files").del();
  await knex("skin_reviews").del();
  await knex("ia_items").del();
  await knex("tweets").del();
  await knex("archive_files").del();
  await knex("refreshes").del();
  // Inserts seed entries
  await knex("skins").insert([
    { md5: "a_fake_md5", skin_type: 1, emails: "" },
    { md5: "a_modern_skin_md5", skin_type: 2, emails: "" },
    { md5: "an_approved_md5", skin_type: 1, emails: "" },
    { md5: "a_rejected_md5", skin_type: 1, emails: "" },
    { md5: "a_nsfw_md5", skin_type: 1, emails: "" },
    { md5: "a_tweeted_md5", skin_type: 1, emails: "" },
    { md5: "48bbdbbeb03d347e59b1eebda4d352d0", skin_type: 1, emails: "" },
  ]);
  await knex("files").insert([
    { skin_md5: "a_fake_md5", file_path: "/a/fake/path.wsz" },
    { skin_md5: "a_modern_skin_md5", file_path: "/a/fake/modern_skin.wal" },
    { skin_md5: "an_approved_md5", file_path: "/a/fake/approved.wsz" },
    { skin_md5: "a_rejected_md5", file_path: "/a/fake/rejected.wsz" },
    { skin_md5: "a_nsfw_md5", file_path: "/a/fake/nsfw.wsz" },
    { skin_md5: "a_tweeted_md5", file_path: "/a/fake/tweeted.wsz" },
    {
      skin_md5: "48bbdbbeb03d347e59b1eebda4d352d0",
      file_path: "/a/fake/Zelda_Amp_3.wsz",
    },
  ]);
  await knex("skin_reviews").insert([
    { skin_md5: "an_approved_md5", review: "APPROVED" },
    { skin_md5: "a_rejected_md5", review: "REJECTED" },
    { skin_md5: "a_tweeted_md5", review: "APPROVED" },
    { skin_md5: "a_nsfw_md5", review: "NSFW" },
  ]);

  await knex("ia_items").insert([
    { skin_md5: "a_fake_md5", identifier: "a_fake_ia_identifier" },
  ]);

  await knex("tweets").insert([
    {
      skin_md5: "a_tweeted_md5",
      tweet_id: "1333893671326871552",
    },
  ]);

  await knex("archive_files").insert([
    {
      skin_md5: "a_fake_md5",
      file_md5: "a_fake_file_md5",
      file_date: new Date("1995-12-17T03:24:00"),
    },
  ]);
}
