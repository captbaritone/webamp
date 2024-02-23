import { Int } from "grats";
import SkinModel from "../../data/SkinModel";
import { knex } from "../../db";
import ModernSkinResolver from "./resolvers/ModernSkinResolver";
import { Root } from "aws-sdk/clients/organizations";
import RootResolver from "./resolvers/RootResolver";
import { GqlCtx } from "./GqlCtx";

/**
 * A collection of "modern" Winamp skins
 * @gqlType */
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

  /**
   * The total number of skins matching the filter
   * @gqlField */
  async count(): Promise<Int> {
    const count = await this._getQuery().count("*", { as: "count" });
    return Number(count[0].count);
  }

  /**
   * The list of skins
   * @gqlField */
  async nodes(
    _args: unknown,
    ctx: GqlCtx
  ): Promise<Array<ModernSkinResolver | null>> {
    const skins = await this._getQuery()
      .select()
      .limit(this._first)
      .offset(this._offset);
    return skins.map((skin) => {
      return new ModernSkinResolver(new SkinModel(ctx, skin));
    });
  }
}

/**
 * All modern skins in the database
 * @gqlField */
export async function modern_skins(
  _: RootResolver,
  {
    first = 10,
    offset = 0,
  }: {
    first: Int;
    offset: Int;
  }
): Promise<ModernSkinsConnection> {
  if (first > 1000) {
    throw new Error("Maximum limit is 1000");
  }
  return new ModernSkinsConnection(first, offset);
}
