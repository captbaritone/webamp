const fetch = require("node-fetch");
const db = require("../db");
const iaItems = db.get("internetArchiveItems");

async function fetchMetadata(identifier) {
  const resp = await fetch(`http://archive.org/metadata/${identifier}`);
  const metadata = await resp.json();
  const metadataFetchDate = Date.now();
  await iaItems.findOneAndUpdate(
    { identifier },
    { $set: { metadata, metadataFetchDate } }
  );
}

async function fetchAllMetadata(limit) {
  const items = await iaItems.find(
    { metadata: { $eq: null } },
    {
      limit,
      fields: {
        identifier: 1,
      },
    }
  );
  console.log(`Found ${items.length} missing metadata`);
  await Promise.all(
    items.map(item => {
      return fetchMetadata(item.identifier);
    })
  );
  return items.length;
}
// TODO: Refetch collections from:
// https://archive.org/advancedsearch.php?q=collection%3Awinampskins&fl%5B%5D=identifier&rows=100000&page=1&output=json
module.exports = async function main() {
  let delay = 60000;
  async function go() {
    console.log("Gonna fetch some more");
    try {
      const count = await fetchAllMetadata(500);
      if (count < 1) {
        console.log("Done.");
        return;
      }
    } catch (e) {
      console.error(e);
      delay += 60000;
    }
    console.log("Scheduling another", delay / 1000);
    setTimeout(go, delay);
  }

  go();
};
