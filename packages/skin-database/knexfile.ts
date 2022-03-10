import path from "path";

const production = {
  client: "sqlite3",
  connection: {
    filename: path.join(__dirname, "./skins.sqlite3"),
  },
  useNullAsDefault: true,
  debug: false,
  migrations: {
    tableName: "knex_migrations",
    directory: path.join(__dirname, "./migrations"),
  },
};

const configs = {
  test: {
    ...production,
    connection: ":memory:",
    seeds: {
      // Only put this in the test config so that we ensure we never clobber prod data.
      directory: path.join(__dirname, "./seeds"),
    },
  },
  development: {
    ...production,
    connection: {
      ...production.connection,
      filename: path.join(__dirname, "./skins-dev.sqlite3"),
    },
  },
  production,
};

module.exports = configs;
