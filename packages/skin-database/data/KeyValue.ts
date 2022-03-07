import { knex } from "../db";

export default class KeyValue {
  static async get(key: string): Promise<any> {
    const result = await knex("key_value").where({ key }).first("value");
    if (result == null) {
      return null;
    }
    return JSON.parse(result.value);
  }

  static async set(key: string, value: any): Promise<void> {
    const { count } = (await knex("key_value")
      .where({ key })
      .count({ count: "*" })
      .first()) as { count: number };
    if (count) {
      return await KeyValue.update(key, value);
    } else {
      return await KeyValue.insert(key, value);
    }
  }

  static async update(key: string, value: any): Promise<void> {
    const json = JSON.stringify(value);
    await knex("key_value").where({ key }).update({ value: json });
  }

  static async insert(key: string, value: any): Promise<any> {
    const json = JSON.stringify(value);
    await knex("key_value").insert({ key, value: json });
  }
}
