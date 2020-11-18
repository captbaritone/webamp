const path = require("path");
const { PROJECT_ROOT } = require("./config");

const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: path.join(PROJECT_ROOT, "./skins.sqlite3"),
  },
  useNullAsDefault: true,
  debug: false,
});

module.exports = { knex };
