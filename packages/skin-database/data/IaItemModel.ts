import UserContext, { ctxWeakMapMemoize } from "./UserContext";
import { IaItemRow } from "../types";
import SkinModel from "./SkinModel";
import DataLoader from "dataloader";
import { knex } from "../db";

const IA_URL = /^(https:\/\/)?archive.org\/details\/([^/]+)\/?/;

export type IaItemDebugData = {
  row: IaItemRow;
};

export default class IaItemModel {
  constructor(readonly ctx: UserContext, readonly row: IaItemRow) {}

  static async fromMd5(
    ctx: UserContext,
    md5: string
  ): Promise<IaItemModel | null> {
    const row = await getIaItemLoader(ctx).load(md5);
    return row == null ? null : new IaItemModel(ctx, row);
  }

  static async fromIdentifier(
    ctx: UserContext,
    identifier: string
  ): Promise<IaItemModel | null> {
    const row = await getIaItemByItentifierLoader(ctx).load(identifier);
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

  async debug(): Promise<IaItemDebugData> {
    return {
      row: this.row,
    };
  }
}

const getIaItemLoader = ctxWeakMapMemoize<DataLoader<string, IaItemRow>>(
  () =>
    new DataLoader(async (md5s) => {
      const rows = await knex("ia_items").whereIn("skin_md5", md5s).select();
      return md5s.map((md5) => rows.find((x) => x.skin_md5 === md5));
    })
);

const getIaItemByItentifierLoader = ctxWeakMapMemoize<
  DataLoader<string, IaItemRow>
>(
  () =>
    new DataLoader(async (identifiers) => {
      const rows = await knex("ia_items")
        .whereIn("identifier", identifiers)
        .select();
      return identifiers.map((identifier) =>
        rows.find((x) => x.identifier === identifier)
      );
    })
);
