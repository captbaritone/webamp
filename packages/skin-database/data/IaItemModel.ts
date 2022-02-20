import UserContext, { ctxWeakMapMemoize } from "./UserContext";
import { IaItemRow } from "../types";
import SkinModel from "./SkinModel";
import DataLoader from "dataloader";
import { knex } from "../db";
import { fetchMetadata, fetchTasks } from "../services/internetArchive";

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

  getMetadataUrl(): string {
    return `https://archive.org/metadata/${this.getIdentifier()}`;
  }

  getMetadataTimestamp(): string | null {
    return this.row.metadata_timestamp;
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

  getMetadataJSON(): string | null {
    return this.row.metadata;
  }

  getMetadataScrapeDate(): string | null {
    return this.row.metadata;
  }

  getAllFiles(): any[] {
    if (!this.row.metadata) {
      return [];
    }
    try {
      return JSON.parse(this.row.metadata).files;
    } catch (e) {
      console.warn("Could not parse", this.row.metadata);
      return [];
    }
  }

  getUploadedFiles(): any {
    return this.getAllFiles().filter(isNotGeneratedFile);
  }

  // There should be exactly one, but in error cases there can be more or none.
  getSkinFiles(): any[] {
    return this.getUploadedFiles().filter((file) => {
      return (
        file.name.toLowerCase().endsWith(".wsz") ||
        file.name.toLowerCase().endsWith(".zip")
      );
    });
  }

  async getTasks(): Promise<any[]> {
    return fetchTasks(this.getIdentifier());
  }

  async hasRunningTasks(): Promise<boolean> {
    const tasks = await this.getTasks();
    const hasTasks = tasks.some((task) => {
      // I'm not really sure what the schema is here. From my limited observations:
      //  - All completed tasks have a cateory of "history"
      //  - All completed tasks have a finished timestamp
      //  - All running tasks have a status of "running"
      return (
        task.status === "running" ||
        task.category !== "history" ||
        task.finished == null
      );
    });

    // Just to be sure, let's invalidate the metadata we have.
    if (hasTasks) {
      await this.invalidateMetadata();
    }
    return hasTasks;
  }

  // Fetch new metadata assuming there a no running tasks.
  async updateMetadataUnsafe(): Promise<void> {
    // TODO: Move some of this into a IA service.
    const identifier = this.getIdentifier();
    const metadata = await fetchMetadata(identifier);

    await knex("ia_items")
      .where("identifier", identifier)
      .update({ metadata: JSON.stringify(metadata, null, 2) })
      .update("metadata_timestamp", knex.fn.now());
  }

  // Check if there are any running tasks and, if not, update the metadata.
  async updateMetadata(): Promise<boolean> {
    if (await this.hasRunningTasks()) {
      return false;
    }
    await this.updateMetadataUnsafe();

    return true;
  }

  // Clear our local cache of metadata. Call this any time you update an IA item
  // in such a way that it might change the metadata.
  async invalidateMetadata(): Promise<void> {
    this.row.metadata = "";
    await knex("ia_items")
      .where("identifier", this.getIdentifier())
      .update({ metadata: "", metadata_timestamp: null });
  }

  async debug(): Promise<IaItemDebugData> {
    return {
      row: this.row,
    };
  }
}

function isNotGeneratedFile(file) {
  switch (file.source) {
    case "derivative":
    case "metadata":
      return false;
  }
  switch (file.format) {
    case "Metadata":
    case "Item Tile":
    case "JPEG Thumb":
      return false;
  }
  return true;
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
