const fetch = require("node-fetch");
const db = require("../db");
const iaItems = db.get("internetArchiveItems");

module.exports = async function main() {
  const resp = await fetch(
    `https://archive.org/advancedsearch.php?q=collection%3Awinampskins&fl%5B%5D=identifier&rows=100000&page=1&output=json`
  );
  const collections = await resp.json();
  const items = collections.response.docs;

  const bulkUpdates = items
    .map(item => {
      const { identifier } = item;
      return {
        updateOne: {
          filter: { identifier },
          update: {
            $set: {
              identifier,
            },
          },
          upsert: true,
        },
      };
    })
    .filter(Boolean);
  await iaItems.bulkWrite(bulkUpdates);
};
