import Knex from "knex";
import * as knexConfigs from "./knexfile";
import { NODE_ENV } from "./config";

export const knex = Knex(knexConfigs[NODE_ENV]);
