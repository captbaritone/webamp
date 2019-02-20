const skins = require("../src/skins.json");
const algoliasearch = require("algoliasearch");
const { getSkinMetadata } = require("./utils");

const client = algoliasearch("HQ9I5Z6IM5", "f5357f4070cdb6ed652d9c3feeede89f");
const index = client.initIndex("Skins");

function tuncate(str, len) {
  const overflow = str.length - len;
  if (overflow < 0) {
    return str;
  }

  const half = Math.floor((len - 1) / 2);

  const start = str.slice(0, half);
  const end = str.slice(-half);
  return `${start} ########### ${end}`;
}

async function buildSkinIndex(hash) {
  const textMetadata = await getSkinMetadata(hash, "extracted-data");
  return {
    objectID: hash,
    md5: hash,
    fileName: skins[hash].fileName,
    emails: textMetadata.emails,
    readmeText: tuncate(textMetadata.raw, 4800)
  };
}

const indexesPromise = Promise.all(
  Object.keys(skins).map(hash => {
    return buildSkinIndex(hash);
  })
);

async function go() {
  const indexes = await indexesPromise;
  const large = indexes.filter(index => {
    return index.readmeText.length > 4790;
  });
  large.map(l => {
    return l.fileName;
  });

  return new Promise((resolve, reject) => {
    index.saveObjects(indexes, function(err, content) {
      if (err != null) reject(err);
      resolve(content);
    });
  });
}

go(); // .then(content => console.log("Updated index for:", content.length));
