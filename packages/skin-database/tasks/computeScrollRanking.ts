import { knex } from "../db";
import type { UserEvent } from "../app/(modern)/scroll/Events";

const WEIGHTS = {
  viewDurationPerSecond: 0.1,
  like: 10,
  download: 5,
  share: 15,
  readmeExpand: 2,
};

interface SessionAggregate {
  skinViewDurations: Map<string, number>;
  skinsLiked: Set<string>;
  skinsDownloaded: Set<string>;
  readmesExpanded: Set<string>;
  sharesSucceeded: Set<string>;
}

interface SkinRanking {
  skinMd5: string;
  totalViewDurationMs: number;
  viewCount: number;
  averageViewDurationMs: number;
  likeCount: number;
  downloadCount: number;
  shareCount: number;
  readmeExpandCount: number;
  rankingScore: number;
}

async function main() {
  try {
    const rankings = await computeSkinRankings();
    console.log(JSON.stringify(rankings, null, 2));
  } catch (error) {
    console.error("Error during aggregation:", error);
    throw error;
  } finally {
    await knex.destroy();
  }
}

if (require.main === module) {
  main();
}

export async function computeSkinRankings(): Promise<SkinRanking[]> {
  const sessionMap = await buildSessionAggregates();

  const skinDataMap = new Map<
    string,
    {
      viewDurations: number[];
      likes: number;
      downloads: number;
      shares: number;
      readmeExpands: number;
    }
  >();

  function getSkinData(skinMd5: string) {
    if (!skinDataMap.has(skinMd5)) {
      skinDataMap.set(skinMd5, {
        viewDurations: [],
        likes: 0,
        downloads: 0,
        shares: 0,
        readmeExpands: 0,
      });
    }
    return skinDataMap.get(skinMd5)!;
  }

  for (const session of sessionMap.values()) {
    for (const [skinMd5, duration] of session.skinViewDurations) {
      getSkinData(skinMd5).viewDurations.push(duration);
    }
    for (const skinMd5 of session.skinsLiked) {
      getSkinData(skinMd5).likes++;
    }
    for (const skinMd5 of session.skinsDownloaded) {
      getSkinData(skinMd5).downloads++;
    }
    for (const skinMd5 of session.sharesSucceeded) {
      getSkinData(skinMd5).shares++;
    }
    for (const skinMd5 of session.readmesExpanded) {
      getSkinData(skinMd5).readmeExpands++;
    }
  }

  const rankings: SkinRanking[] = [];

  for (const [skinMd5, data] of skinDataMap) {
    const totalViewDurationMs = data.viewDurations.reduce(
      (sum, duration) => sum + duration,
      0
    );
    const viewCount = data.viewDurations.length;
    const averageViewDurationMs =
      viewCount > 0 ? totalViewDurationMs / viewCount : 0;

    const rankingScore =
      (averageViewDurationMs / 1000) * WEIGHTS.viewDurationPerSecond +
      data.likes * WEIGHTS.like +
      data.downloads * WEIGHTS.download +
      data.shares * WEIGHTS.share +
      data.readmeExpands * WEIGHTS.readmeExpand;

    rankings.push({
      skinMd5,
      totalViewDurationMs,
      viewCount,
      averageViewDurationMs,
      likeCount: data.likes,
      downloadCount: data.downloads,
      shareCount: data.shares,
      readmeExpandCount: data.readmeExpands,
      rankingScore,
    });
  }

  rankings.sort((a, b) => b.rankingScore - a.rankingScore);
  return rankings;
}

async function buildSessionAggregates(): Promise<
  Map<string, SessionAggregate>
> {
  const events = await knex("user_log_events")
    .select("session_id", "timestamp", "metadata")
    .orderBy("timestamp", "asc");

  const sessionMap = new Map<string, SessionAggregate>();

  function getSession(sessionId: string): SessionAggregate {
    if (!sessionMap.has(sessionId)) {
      sessionMap.set(sessionId, {
        skinViewDurations: new Map(),
        skinsLiked: new Set(),
        skinsDownloaded: new Set(),
        readmesExpanded: new Set(),
        sharesSucceeded: new Set(),
      });
    }
    return sessionMap.get(sessionId)!;
  }

  for (const row of events) {
    const event: UserEvent = JSON.parse(row.metadata);
    const session = getSession(row.session_id);

    switch (event.type) {
      case "skin_view_end":
        session.skinViewDurations.set(event.skinMd5, event.durationMs);
        break;
      case "readme_expand":
        session.readmesExpanded.add(event.skinMd5);
        break;
      case "skin_download":
        session.skinsDownloaded.add(event.skinMd5);
        break;
      case "skin_like":
        if (event.liked) {
          session.skinsLiked.add(event.skinMd5);
        } else {
          session.skinsLiked.delete(event.skinMd5);
        }
        break;
      case "share_success":
        session.sharesSucceeded.add(event.skinMd5);
        break;
    }
  }

  return sessionMap;
}

export { buildSessionAggregates };
export type { SessionAggregate };
