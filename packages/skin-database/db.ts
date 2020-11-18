import path from "path";
import { PROJECT_ROOT } from "./config";
import Knex from "knex";

export const knex = Knex({
  client: "sqlite3",
  connection: {
    filename: path.join(PROJECT_ROOT, "./skins.sqlite3"),
  },
  useNullAsDefault: true,
  debug: false,
});
