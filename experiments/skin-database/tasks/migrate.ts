const db = require("../db");
const iaItems = db.get("internetArchiveItems");
const skins = db.get("skins");

async function main() {
  const item = await iaItems.findOne({
    migrated: { $exists: false },
    md5: { $exists: true },
  });

  skins.update({ md5: item.md5 });

  console.log(item);
}

export default main;
