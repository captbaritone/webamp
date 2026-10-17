import path from "path";
import type { Metadata } from "next";
import { knex } from "../../db";
import { getMuseumPage, getRandomMuseumPage } from "../../data/skins";
import { screenshotUrlFromHash } from "../../legacy-client/src/utils";
import { skinPath } from "../(modern)/scroll/paths";
import { analyze, botReasons } from "../dev/events/analyze";
import {
  loadSessions,
  pulledAt,
  PULLED_EVENTS_FILE,
  type EventSource,
} from "../dev/events/loadEvents";
import { rankSkins, type EventSort, type RankedSkin } from "./rankings";
import "../dev/events/dashboard.css";
import "./sorts.css";

// Prototypes of other orders the museum could be in, side by side with the
// museum's own, to look through before building one into the grid. Event
// based ones come from the same log as /dev/events (see rankings.ts).
//
// Public but unlisted: nothing links here and search engines are asked not
// to index it. Opening a skin from here isn't logged (see eventLogger.ts),
// so looking through a ranking doesn't feed back into it.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sorts",
  robots: { index: false },
};

const SORTS = {
  museum: {
    label: "Museum",
    about: "The museum's own order, for comparison.",
  },
  random: {
    label: "Random",
    about: "Random skins from the museum, picked anew on each load.",
  },
  direct: {
    label: "Direct loads",
    about:
      "Sessions that started on the skin's permalink: shared links, search results, bookmarks. Also counts reloads of a feed page, and /feed (which opens the museum's top skin).",
  },
  grid_clicks: {
    label: "Clicks / grid view",
    about:
      "Taps on the skin in the museum grid per time it was seen there, against an average skin at the same positions (score 1 = average).",
  },
  grid_downloads: {
    label: "Downloads / grid view",
    about:
      "Sessions that saw the skin in the museum grid and went on to download it, against an average skin at the same positions (score 1 = average).",
  },
  feed_downloads: {
    label: "Downloads / feed view",
    about:
      "Downloads per look at the skin in the feed (not scrolled straight past), smoothed toward the overall rate. The strongest signal so far.",
  },
} as const;

type Sort = keyof typeof SORTS;

const PAGE_SIZE = 120;
// Event rankings are recomputed this often (or when a new copy is pulled).
const CACHE_MS = 10 * 60_000;

type EventRankings = {
  rankings: Record<EventSort, RankedSkin[]>;
  sessions: number;
};

// Shared by every request: computing them reads the whole event log. A
// request while they're being computed waits for the same computation.
let cache: { key: string; at: number; result: Promise<EventRankings> } | null =
  null;

function eventRankings(source: EventSource): Promise<EventRankings> {
  const key = `${source}:${pulledAt()?.getTime() ?? 0}`;
  if (cache == null || cache.key !== key || Date.now() - cache.at > CACHE_MS) {
    const result = loadSessions(source, { minVersion: 3, since: null }).then(
      (stored) => {
        const people = stored.filter((s) => botReasons(s).length === 0);
        return {
          rankings: rankSkins(analyze(people)),
          sessions: people.length,
        };
      }
    );
    const entry = { key, at: Date.now(), result };
    cache = entry;
    // Try again on the next request rather than serving the failure.
    result.catch(() => {
      if (cache === entry) cache = null;
    });
  }
  return cache.result;
}

type Tile = {
  md5: string;
  fileName: string;
  museumPosition: number | null;
  score?: number;
  detail?: string;
};

/** The file names and museum positions of these skins, without NSFW ones. */
async function describe(
  skins: Array<Pick<RankedSkin, "md5"> & Partial<RankedSkin>>
): Promise<Tile[]> {
  if (skins.length === 0) return [];
  const rows: Array<{
    md5: string;
    file_path: string | null;
    museum: number | null;
  }> = await knex.raw(
    `
SELECT
  skins.md5,
  (SELECT file_path FROM files WHERE files.skin_md5 = skins.md5 LIMIT 1) AS file_path,
  museum_sort_order.rowid AS museum
FROM skins
LEFT JOIN museum_sort_order ON museum_sort_order.skin_md5 = skins.md5
WHERE skins.md5 IN (${skins.map(() => "?").join(",")})`,
    skins.map((s) => s.md5)
  );
  const byMd5 = new Map(rows.map((row) => [row.md5, row]));
  return skins.flatMap((skin) => {
    const row = byMd5.get(skin.md5);
    if (row == null) return [];
    return [
      {
        md5: skin.md5,
        fileName: path.basename(row.file_path ?? `${skin.md5}.wsz`),
        museumPosition: row.museum,
        score: skin.score,
        detail: skin.detail,
      },
    ];
  });
}

async function nsfwSkins(): Promise<Set<string>> {
  const rows: Array<{ skin_md5: string }> = await knex("skin_reviews")
    .where("review", "NSFW")
    .distinct("skin_md5");
  return new Set(rows.map((row) => row.skin_md5));
}

// In development, a pulled copy of production's events if there is one (see
// /dev/events). In production, always the server's own.
function readSource(param: string | undefined): EventSource {
  if (process.env.NODE_ENV === "production" || pulledAt() == null) {
    return "local";
  }
  return param === "local" ? "local" : "pulled";
}

export default async function Sorts({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const sort: Sort =
    params.sort != null && Object.hasOwn(SORTS, params.sort)
      ? (params.sort as Sort)
      : "museum";
  const source = readSource(params.source);
  const offset = Math.max(0, Math.floor(Number(params.offset)) || 0);

  let tiles: Tile[];
  let total: number | null = null;
  let note: string | null = null;
  if (sort === "museum") {
    const page = await getMuseumPage({ offset, first: PAGE_SIZE });
    tiles = page.map((skin, i) => ({
      md5: skin.md5,
      fileName: skin.fileName,
      museumPosition: offset + i + 1,
    }));
  } else if (sort === "random") {
    const page = await getRandomMuseumPage(PAGE_SIZE);
    tiles = await describe(page.map((skin) => ({ md5: skin.md5 })));
  } else {
    const [{ rankings, sessions }, nsfw] = await Promise.all([
      eventRankings(source),
      nsfwSkins(),
    ]);
    const ranked = rankings[sort].filter((skin) => !nsfw.has(skin.md5));
    total = ranked.length;
    tiles = await describe(ranked.slice(offset, offset + PAGE_SIZE));
    note = `${ranked.length.toLocaleString()} skins ranked from ${sessions.toLocaleString()} sessions, from ${
      source === "pulled"
        ? `${PULLED_EVENTS_FILE} (pulled ${pulledAt()?.toLocaleString()})`
        : "this server's database"
    }.`;
  }

  const link = (changes: Record<string, string | number | null>) => {
    const next = new URLSearchParams();
    const merged = { sort, offset, source: params.source ?? null, ...changes };
    for (const [k, v] of Object.entries(merged)) {
      if (v != null && v !== 0 && v !== "") next.set(k, String(v));
    }
    return `/sorts?${next}`;
  };

  return (
    <main className="dashboard sorts">
      <header>
        <h1>Sorts</h1>
        <nav className="sort-tabs">
          {(Object.keys(SORTS) as Sort[]).map((key) => (
            <a
              key={key}
              href={link({ sort: key, offset: null })}
              aria-current={key === sort ? "page" : undefined}
            >
              {SORTS[key].label}
            </a>
          ))}
        </nav>
        <p className="note">{SORTS[sort].about}</p>
        {note != null && <p className="note">{note}</p>}
      </header>
      <ol className="sort-grid" start={offset + 1}>
        {tiles.map((tile, i) => (
          <li key={tile.md5}>
            <a
              href={skinPath(tile.md5, tile.fileName)}
              target="_blank"
              rel="noopener"
            >
              <img
                src={screenshotUrlFromHash(tile.md5)}
                alt={tile.fileName}
                loading="lazy"
                width={275}
                height={348}
              />
            </a>
            <div className="sort-caption">
              <div className="sort-name">
                <span className="sort-rank">{offset + i + 1}.</span>{" "}
                {tile.fileName}
              </div>
              {tile.detail != null && (
                <div>
                  {tile.detail}
                  {sort.startsWith("grid") || sort === "feed_downloads"
                    ? ` · score ${tile.score!.toFixed(
                        sort === "feed_downloads" ? 3 : 2
                      )}`
                    : ""}
                </div>
              )}
              <div className="note">
                {tile.museumPosition == null
                  ? "Not in the museum"
                  : `Museum #${tile.museumPosition.toLocaleString()}`}
              </div>
            </div>
          </li>
        ))}
      </ol>
      {sort !== "random" && (
        <nav className="sort-pages">
          {offset > 0 && (
            <a href={link({ offset: Math.max(0, offset - PAGE_SIZE) })}>
              ← Previous
            </a>
          )}
          {(total == null
            ? tiles.length === PAGE_SIZE
            : offset + PAGE_SIZE < total) && (
            <a href={link({ offset: offset + PAGE_SIZE })}>Next →</a>
          )}
        </nav>
      )}
      {sort === "random" && (
        <nav className="sort-pages">
          <a href={link({})}>More random skins</a>
        </nav>
      )}
    </main>
  );
}
