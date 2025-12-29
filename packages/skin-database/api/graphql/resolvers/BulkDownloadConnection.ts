import { Int } from "grats";
import { knex } from "../../../db";
import SkinModel from "../../../data/SkinModel";
import ClassicSkinResolver from "./ClassicSkinResolver";
import ModernSkinResolver from "./ModernSkinResolver";
import UserContext from "../../../data/UserContext";
import { ISkin } from "./CommonSkinResolver";
import { SkinRow } from "../../../types";

/**
 * Connection for bulk download skin metadata
 * @gqlType
 */
export class BulkDownloadConnection {
  _offset: number;
  _first: number;

  constructor(first: number, offset: number) {
    this._first = first;
    this._offset = offset;
  }

  /**
   * Total number of skins available for download
   * @gqlField
   */
  async totalCount(): Promise<Int> {
    // Get count of both classic and modern skins
    const [classicResult, modernResult] = await Promise.all([
      knex("skins").where({ skin_type: 1 }).count("* as count"),
      knex("skins").where({ skin_type: 2 }).count("* as count"),
    ]);

    const classicCount = Number(classicResult[0].count);
    const modernCount = Number(modernResult[0].count);

    return classicCount + modernCount;
  }

  /**
   * Estimated total size in bytes (approximation for progress indication)
   * @gqlField
   */
  async estimatedSizeBytes(): Promise<string> {
    const totalCount = await this.totalCount();
    // Rough estimate: average skin is ~56KB
    return (totalCount * 56 * 1024).toString();
  }

  /**
   * List of skin metadata for bulk download
   * @gqlField
   */
  async nodes(ctx: UserContext): Promise<Array<ISkin>> {
    // Get skins ordered by skin_type (classic first, then modern) and id for consistency
    const skins = await knex<SkinRow>("skins")
      .select(["id", "md5", "skin_type", "emails"])
      .orderBy([{ column: "skins.id", order: "asc" }])
      .where({ skin_type: 1 })
      .orWhere({ skin_type: 2 })
      .where((builder) => {
        builder.where({ skin_type: 1 }).orWhere({ skin_type: 2 });
      })
      // https://www.virustotal.com/gui/file/cc75df902c1e128433a7f7b8635aa928fe4cefbdcd91564b7e66305a25edd538
      // This got flagged as malicious. Unclear if it's a false positive or real.
      .whereNot({ md5: "5dac271c708d620db7b29d5bcf1598c2" })
      .limit(this._first)
      .offset(this._offset);

    return skins.map((skinRow) => {
      const skinModel = new SkinModel(ctx, skinRow);

      if (skinRow.skin_type === 1) {
        return new ClassicSkinResolver(skinModel);
      } else if (skinRow.skin_type === 2) {
        return new ModernSkinResolver(skinModel);
      } else {
        throw new Error("Expected classic or modern skin");
      }
    });
  }
}

/**
 * Get metadata for bulk downloading all skins in the museum
 * @gqlQueryField
 */
export function bulkDownload({
  first = 1000,
  offset = 0,
}: {
  first?: Int;
  offset?: Int;
}): BulkDownloadConnection {
  if (first > 10000) {
    throw new Error("Maximum limit is 10000 for bulk download");
  }
  return new BulkDownloadConnection(first, offset);
}
