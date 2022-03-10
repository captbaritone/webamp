import Knex from "knex";
import * as knexConfigs from "./knexfile";
import { NODE_ENV } from "./config";

throw new Error(`NODE_ENV: ${NODE_ENV}`);

export const knex = Knex(knexConfigs[NODE_ENV]);
