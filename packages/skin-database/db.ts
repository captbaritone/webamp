import Knex from "knex";
import * as knexConfigs from "./knexfile";
import { NODE_ENV } from "./config";

// eslint-disable-next-line new-cap -- Knex uses this pattern
export const knex = Knex(knexConfigs[NODE_ENV ?? "test"]);
