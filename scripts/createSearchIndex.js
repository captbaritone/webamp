const skins = require("../src/skins.json");
const algoliasearch = require("algoliasearch");
const { getSkinMetadata } = require("./utils");

const client = algoliasearch("HQ9I5Z6IM5", "f5357f4070cdb6ed652d9c3feeede89f");
const index = client.initIndex("Skins");

async function buildSkinIndex(hash) {
  const textMetadata = await getSkinMetadata(hash, "extracted-data");
  return {
    objectID: hash,
    md5: hash,
    fileName: skins[hash].fileName,
    emails: textMetadata.emails,
    readmeText: textMetadata.raw.slice(0, 1000)
  };
}

const indexesPromise = Promise.all(
  Object.keys(skins).map(hash => {
    return buildSkinIndex(hash);
  })
);

async function go() {
  const indexes = await indexesPromise;

  return new Promise((resolve, reject) => {
    index.saveObjects(indexes, function(err, content) {
      if (err != null) reject(err);
      resolve(content);
    });
  });
}

go().then(content => console.log(content));
