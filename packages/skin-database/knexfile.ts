import path from "path";
import { PROJECT_ROOT } from "./config";

const production = {
  client: "sqlite3",
  connection: {
    filename: path.join(PROJECT_ROOT, "./skins.sqlite3"),
  },
  useNullAsDefault: true,
  debug: false,
  migrations: {
    tableName: "knex_migrations",
    directory: path.join(PROJECT_ROOT, "./migrations"),
  },
};

const configs = {
  test: {
    ...production,
    connection: ":memory:",
    seeds: {
      // Only put this in the test config so that we ensure we never clobber prod data.
      directory: path.join(PROJECT_ROOT, "./seeds"),
    },
  },
  development: {
    ...production,
    connection: {
      ...production.connection,
      filename: path.join(PROJECT_ROOT, "./skins-dev.sqlite3"),
    },
  },
  production,
};

module.exports = configs;
