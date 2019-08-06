const db = require("../db");
const iaItems = db.get("internetArchiveItems");

module.exports = async function main() {
  const items = await iaItems.find(
    { "metadata.metadata.skintype": { $eq: "wsz" }, md5: { $eq: null } },
    {
      fields: {
        identifier: 1,
        metadata: 1,
      },
    }
  );

  for (const item of items) {
    const skinFiles = item.metadata.files.filter(file => {
      return file.name.endsWith(".wsz");
    });
    if (skinFiles.length !== 1) {
      console.warn(
        `Found a skin item with ${skinFiles.length} skin files. Identifier: ${
          item.identifier
        }`
      );
      continue;
    }

    const { md5, name } = skinFiles[0];
    await iaItems.update(
      { _id: { $eq: item._id } },
      { $set: { md5, skinFileName: name } }
    );
  }
};
