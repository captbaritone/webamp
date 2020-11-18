import UserContext from "./UserContext";
import { IaItemRow } from "../types";

export default class IaItemModel {
  constructor(readonly ctx: UserContext, readonly row: IaItemRow) {}

  static async fromMd5(
    ctx: UserContext,
    md5: string
  ): Promise<IaItemModel | null> {
    const row = await ctx.iaItem.load(md5);
    return row == null ? null : new IaItemModel(ctx, row);
  }

  static async fromIdentifier(
    ctx: UserContext,
    identifier: string
  ): Promise<IaItemModel | null> {
    const row = await ctx.iaItemByIdentifier.load(identifier);
    return row == null ? null : new IaItemModel(ctx, row);
  }

  getMd5(): string {
    return this.row.skin_md5;
  }

  getUrl(): string {
    return `https://archive.org/details/${this.getIdentifier()}`;
  }

  getIdentifier(): string {
    const { identifier } = this.row;
    if (identifier == null) {
      throw new Error(
        `Missing identifier for IA Item with md5 ${this.row.skin_md5}`
      );
    }
    return identifier;
  }
}
