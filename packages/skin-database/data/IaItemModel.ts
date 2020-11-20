import UserContext from "./UserContext";
import { IaItemRow } from "../types";
import SkinModel from "./SkinModel";

const IA_URL = /^(https:\/\/)?archive.org\/details\/([^/]+)\/?/;

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

  static async fromAnything(
    ctx: UserContext,
    anything: string
  ): Promise<IaItemModel | null> {
    const itemMatchResult = anything.match(IA_URL);
    if (itemMatchResult != null) {
      const itemName = itemMatchResult[2];
      const item = await IaItemModel.fromIdentifier(ctx, itemName);
      if (item != null) {
        return item;
      }
    }
    return IaItemModel.fromIdentifier(ctx, anything);
  }

  async getSkin(): Promise<SkinModel> {
    const skin = await SkinModel.fromMd5(this.ctx, this.getMd5());
    if (skin == null) {
      throw new Error(`Could not find skin for md5 "${this.getMd5()}"`);
    }
    return skin;
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
