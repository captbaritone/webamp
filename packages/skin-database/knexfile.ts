import path from "path";

const production = {
  client: "sqlite3",
  connection: {
    // Use process.cwd() and not __dir since Next runs from a build directory
    filename: path.join(process.cwd(), "./skins.sqlite3"),
  },
  useNullAsDefault: true,
  debug: false,
  migrations: {
    tableName: "knex_migrations",
    // Use process.cwd() and not __dir since Next runs from a build directory
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
