import Knex from "knex";
import * as knexConfigs from "./knexfile";

export const knex = Knex(knexConfigs[process.env.NODE_ENV || "development"]);
