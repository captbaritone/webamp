import * as Knex from "knex";

const DATA = `8512eb9cb19bcdcb044b6fb1f7dc3a23 17920085909318662 https://www.instagram.com/p/CZfUam9vqNT/
4b874c85014b42cf3d67cfab35e20109 17913896906185364 https://www.instagram.com/p/CZfU_gKPOsU/
bb7fd9baf2292c81436825248837acc7 18163890691172492 https://www.instagram.com/p/CZfVJwVviZJ/
25a932542e307416ca86da4e16be1b32 18277348171056432 https://www.instagram.com/p/CZfV4zpP2ck/
6276ab488d68d206790fb4456c8da8d7 17916750572254361 https://www.instagram.com/p/CZfZD3xPhft/
d1a20befb85937bb2dc65ab2928866e3 18211778629137054 https://www.instagram.com/p/CZfuQo9pPMO/
eda35a53d88257c88c0dbf7ca9c4a98d 17891238578503535 https://www.instagram.com/p/CZfvHIqJT5o/
8c766a8ddcf6477d7b66a00e53489214 17912408768210808 https://www.instagram.com/p/CZfwrBTJbLB/
8a2a63e84dbd30d7905ddf6fa6974d12 17938724929881449 https://www.instagram.com/p/CZfxOYsJR9V/
3b3b8b07fb7d268f6092d4321f0a9b9c 17972294260499364 https://www.instagram.com/p/CZgANzTMN3V/
4ac2ffccd4c609b2570d8320f6891567 17958854734595049 https://www.instagram.com/p/CZgEoCsM8fN/
4fcfeabdf0fb65f1f999ce9d236c9723 18186035701091094 https://www.instagram.com/p/CZgFMXmMww_/
69d0e1268079d24162dc010064dbe838 18163152052171802 https://www.instagram.com/p/CZgWbj2grPb/
b3239d943c5347c267a6ee3e1e81e1e5 17895571130531480 https://www.instagram.com/p/CZgWwGrgXh8/`;

export async function up(knex: Knex): Promise<any> {
  const lines = DATA.split("\n");
  for (const line of lines) {
    const [md5, postId, url] = line.split(" ");

    await knex("instagram_posts").insert({
      skin_md5: md5,
      post_id: postId,
      url: url,
    });
  }
}

export async function down(knex: Knex): Promise<any> {
  const lines = DATA.split("\n");
  for (const line of lines) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_md5, postId, _url] = line.split(" ");

    await knex("instagram_posts").delete().where({ post_id: postId });
  }
}
