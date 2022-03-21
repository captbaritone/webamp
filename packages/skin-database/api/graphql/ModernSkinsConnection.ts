import SkinModel from "../../data/SkinModel";
import { knex } from "../../db";
import ModernSkinResolver from "./resolvers/ModernSkinResolver";

export default class ModernSkinsConnection {
  _first: number;
  _offset: number;
  constructor(first: number, offset: number) {
    this._first = first;
    this._offset = offset;
  }
  _getQuery() {
    const query = knex("skins").where({ skin_type: 2 });
    return query;
  }

  async count() {
    const count = await this._getQuery().count("*", { as: "count" });
    return count[0].count;
  }

  async nodes(_args, ctx) {
    const skins = await this._getQuery()
      .select()
      .limit(this._first)
      .offset(this._offset);
    return skins.map((skin) => {
      return new ModernSkinResolver(new SkinModel(ctx, skin));
    });
  }
}
