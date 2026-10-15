import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { screenshotUrlFromHash } from "../../../legacy-client/src/utils";
import {
  analyze,
  BOT_REASONS,
  botReasons,
  bucketGroups,
  countBy,
  countHistogram,
  feedRetention,
  groupBy,
  histogram,
  PASS_THROUGH_MS,
  quantile,
  rate,
  type StoredSession,
  type View,
} from "./analyze";
import {
  Bars,
  Card,
  formatMs,
  formatPercent,
  Histogram,
  LineChart,
  Section,
  Stats,
  Table,
} from "./charts";
import {
  loadSessions,
  pulledAt,
  PULLED_EVENTS_FILE,
  type EventSource,
} from "./loadEvents";
import "./dashboard.css";

// A report on the new museum UI's event log, to decide which signals are
// worth building a ranking on. Development only: it reads the dev server's
// database, or a copy of production's events (scripts/pull-events.sh).

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Event Log",
  robots: { index: false },
};

const DWELL_BOUNDS = [300, 1000, 2000, 5000, 10_000, 30_000, 60_000, 180_000];
const SESSION_BOUNDS = [
  10_000, 30_000, 60_000, 120_000, 300_000, 600_000, 1_800_000,
];
const READY_BOUNDS = [250, 500, 1000, 2000, 5000];
const COUNT_BOUNDS = [0, 1, 2, 3, 5, 10, 20, 50];
const DEPTH_BOUNDS = [0, 1, 2, 3, 5, 10, 20, 50];
const POSITION_BOUNDS = [0, 10, 20, 50, 100, 200, 500, 1000];
const GRID_POSITION_BOUNDS = [0, 5, 10, 20, 50, 100, 200, 500];
const RETENTION_DEPTH = 50;

type Filters = {
  source: EventSource;
  minVersion: number;
  days: number | null;
  layout: "all" | "mobile" | "desktop";
  // Sessions that look like people, ones that look like bots (see
  // botReasons), or both.
  traffic: "people" | "bots" | "all";
};

function readFilters(params: Record<string, string | undefined>): Filters {
  const pulled = pulledAt() != null;
  const days = Number(params.days);
  return {
    source:
      params.source === "local" || (!pulled && params.source !== "pulled")
        ? "local"
        : "pulled",
    minVersion: params.v === "4" ? 4 : 3,
    days: Number.isFinite(days) && days > 0 ? days : null,
    layout:
      params.layout === "mobile" || params.layout === "desktop"
        ? params.layout
        : "all",
    traffic:
      params.traffic === "bots" || params.traffic === "all"
        ? params.traffic
        : "people",
  };
}

export default async function EventsDashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const filters = readFilters(await searchParams);
  const pulled = pulledAt();

  let stored: StoredSession[];
  try {
    stored = await loadSessions(filters.source, {
      minVersion: filters.minVersion,
      since:
        filters.days == null ? null : Date.now() - filters.days * 86_400_000,
    });
  } catch (error) {
    return (
      <main className="dashboard">
        <h1>Event Log</h1>
        <p className="note">
          Couldn&apos;t read events from{" "}
          {filters.source === "pulled" ? PULLED_EVENTS_FILE : "the database"}:{" "}
          {String(error)}
        </p>
      </main>
    );
  }
  const reasons = new Map(stored.map((s) => [s.id, botReasons(s)]));
  const suspected = stored.filter((s) => reasons.get(s.id)!.length > 0);
  const all = analyze(
    filters.traffic === "all"
      ? stored
      : stored.filter(
          (s) => reasons.get(s.id)!.length > 0 === (filters.traffic === "bots")
        )
  );
  const sessionLayouts = new Map(all.sessions.map((s) => [s.id, s.layout]));
  const inLayout = (id: string) =>
    filters.layout === "all" || sessionLayouts.get(id) === filters.layout;
  const sessions = all.sessions.filter((s) => inLayout(s.id));
  const allViews = all.views.filter((v) => inLayout(v.sessionId));
  // Views that were looked at: not scrolled straight past, and Webamp
  // managed to show the skin.
  const views = allViews.filter((v) => !v.passThrough && !v.failed);
  const timed = views.filter((v) => v.activeMs != null);
  const impressions = all.impressions.filter((i) => inLayout(i.sessionId));

  return (
    <main className="dashboard">
      <header>
        <h1>Event Log</h1>
        <p className="note">
          The new museum UI&apos;s events, from{" "}
          {filters.source === "pulled"
            ? `production (pulled ${
                pulled?.toLocaleString() ?? "never"
              }; refresh with scripts/pull-events.sh)`
            : "this dev server's database"}
          .{" "}
          {all.firstReceived != null &&
            `${new Date(all.firstReceived).toLocaleDateString()} – ${new Date(
              all.lastReceived!
            ).toLocaleDateString()}.`}
        </p>
        <FilterBar filters={filters} hasPulled={pulled != null} />
        <p className="note">
          {suspected.length.toLocaleString()} of{" "}
          {stored.length.toLocaleString()} sessions look like bots
          {filters.traffic === "people" && " and are left out"}
          {filters.traffic === "bots" && ", and only they are shown"}
          {suspected.length > 0 &&
            ` (${countBy(
              suspected.flatMap((s) => reasons.get(s.id)!),
              (reason) => reason
            )
              .map(([reason, n]) => `${reason}: ${n}`)
              .join(", ")})`}
          .
        </p>
      </header>

      <Section title="Overview">
        <Card title="Totals" wide>
          <Stats
            items={[
              { label: "Sessions", value: sessions.length.toLocaleString() },
              {
                label: "Opened the feed",
                value: formatPercent(
                  rate(sessions, (s) => s.openedFeed),
                  0
                ),
              },
              { label: "Feed views", value: views.length.toLocaleString() },
              {
                label: "Skins viewed",
                value: new Set(
                  views.map((v) => v.skinMd5)
                ).size.toLocaleString(),
              },
              {
                label: "Grid impressions",
                value: impressions.length.toLocaleString(),
                hint: "version 4",
              },
              {
                label: "Median session",
                value: formatMs(
                  quantile(
                    sessions.map((s) => s.durationMs),
                    0.5
                  )
                ),
              },
              {
                label: "Median dwell",
                value: formatMs(
                  quantile(
                    timed.map((v) => v.activeMs!),
                    0.5
                  )
                ),
              },
              {
                label: "Views with a download",
                value: formatPercent(rate(views, (v) => v.downloaded)),
              },
            ]}
          />
        </Card>
      </Section>

      <SessionsSection sessions={sessions} />
      <FeedSection views={views} allViews={allViews} />
      <SignalsSection views={views} />
      <SourcesSection views={views} impressions={impressions} />
      <CoverageSection views={views} />
      <GridSection
        sessions={sessions}
        impressions={impressions}
        searches={all.searches}
      />
      <WebampSection
        allViews={allViews}
        sessions={sessions}
        failures={all.loadFailures.length}
        targets={all.webampTargets}
      />
      <LeavingSection
        sessions={sessions}
        linkClicks={all.linkClicks}
        switches={all.viewSwitches}
      />
      <TopSkinsSection views={views} />
      <QualitySection
        all={all}
        sessions={sessions}
        botCounts={
          new Map(
            countBy(
              suspected.flatMap((s) => reasons.get(s.id)!),
              (reason) => reason
            )
          )
        }
        total={stored.length}
      />
    </main>
  );
}

function FilterBar({
  filters,
  hasPulled,
}: {
  filters: Filters;
  hasPulled: boolean;
}) {
  return (
    <form className="filters" method="get">
      <label>
        Data
        <select name="source" defaultValue={filters.source}>
          <option value="pulled" disabled={!hasPulled}>
            Production copy
          </option>
          <option value="local">Dev database</option>
        </select>
      </label>
      <label>
        Versions
        <select name="v" defaultValue={String(filters.minVersion)}>
          <option value="3">3 and later</option>
          <option value="4">4 and later</option>
        </select>
      </label>
      <label>
        Period
        <select name="days" defaultValue={String(filters.days ?? "")}>
          <option value="">All time</option>
          <option value="1">Last day</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
        </select>
      </label>
      <label>
        Traffic
        <select name="traffic" defaultValue={filters.traffic}>
          <option value="people">Likely people</option>
          <option value="bots">Suspected bots</option>
          <option value="all">Everything</option>
        </select>
      </label>
      <label>
        Layout
        <select name="layout" defaultValue={filters.layout}>
          <option value="all">All</option>
          <option value="mobile">Mobile</option>
          <option value="desktop">Desktop</option>
        </select>
      </label>
      <button type="submit">Apply</button>
    </form>
  );
}

function SessionsSection({ sessions }: { sessions: Analysis["sessions"] }) {
  return (
    <Section
      title="Sessions"
      note="A session is one visit in one tab, across the grid and the feed, until it's closed or reloaded."
    >
      <Card
        title="Session length"
        note="First event to last, including time in the background."
      >
        <Histogram
          bins={histogram(
            sessions.map((s) => s.durationMs),
            SESSION_BOUNDS,
            formatMs
          )}
        />
      </Card>
      <Card
        title="Skins viewed per session"
        note={`In the feed, not counting ones scrolled past in under ${PASS_THROUGH_MS}ms.`}
      >
        <Histogram
          bins={countHistogram(
            sessions.map((s) => s.feedViews),
            COUNT_BOUNDS
          )}
        />
      </Card>
      <Card title="Where sessions start">
        <Bars
          rows={countBy(sessions, (s) => s.startView ?? "unknown").map(
            ([label, value]) => ({ label, value })
          )}
        />
      </Card>
      <Card title="Layout">
        <Bars
          rows={countBy(
            sessions,
            (s) => `${s.layout ?? "?"} · ${s.pointer ?? "?"} pointer`
          ).map(([label, value]) => ({ label, value }))}
        />
      </Card>
      <Card
        title="Referrers"
        note="External sites sessions came from (direct visits aren't listed)."
      >
        <Bars
          rows={countBy(
            sessions.filter((s) => s.referrerHost != null),
            (s) => s.referrerHost!
          )
            .slice(0, 10)
            .map(([label, value]) => ({ label, value }))}
          total={sessions.length}
        />
      </Card>
      <Card
        title="How sessions end"
        note="Bounce: nothing but the start (and page visibility). Link: followed a link elsewhere in the same tab."
      >
        <Bars
          rows={countBy(sessions, (s) => s.endedIn).map(([label, value]) => ({
            label,
            value,
          }))}
        />
      </Card>
    </Section>
  );
}

function FeedSection({ views, allViews }: { views: View[]; allViews: View[] }) {
  const byLayout = groupBy(views, (v) => v.layout ?? "unknown");
  const exitByDepth = bucketGroups(views, DEPTH_BOUNDS, (v) => v.visitDepth);
  const timed = views.filter((v) => v.activeMs != null);
  return (
    <Section title="Feed">
      <Card
        title="How far visits to the feed go"
        note="Share of visits to the feed that reached each skin. Where this drops is where people stop."
        wide
      >
        <LineChart
          xLabel="skins into the visit"
          series={[
            { name: "all", values: feedRetention(views, RETENTION_DEPTH) },
            ...[...byLayout].map(([name, group]) => ({
              name,
              values: feedRetention(group, RETENTION_DEPTH),
            })),
          ]}
        />
      </Card>
      <Card
        title="Dwell time per view"
        note="Time the skin was in view with the page visible."
      >
        <Histogram
          bins={histogram(
            timed.map((v) => v.activeMs!),
            DWELL_BOUNDS,
            formatMs
          )}
        />
      </Card>
      <Card
        title="Median dwell by depth"
        note="Skins into the visit to the feed (0: the one it opened on)."
      >
        <Bars
          rows={bucketGroups(timed, DEPTH_BOUNDS, (v) => v.visitDepth).map(
            ([label, group]) => ({
              label,
              value:
                quantile(
                  group.map((v) => v.activeMs!),
                  0.5
                ) ?? 0,
              detail: `(${group.length})`,
            })
          )}
          format={formatMs}
        />
      </Card>
      <Card
        title="Session ended here, by depth"
        note="Of views at each depth, the share that were the last thing the session saw."
      >
        <Bars
          rows={exitByDepth.map(([label, group]) => ({
            label,
            value: rate(group, (v) => v.exit) ?? 0,
            detail: `(${group.length})`,
          }))}
          format={(v) => formatPercent(v)}
        />
      </Card>
      <Card title="How views end">
        <Bars
          rows={countBy(views, (v) => v.endedBy ?? "never ended").map(
            ([label, value]) => ({ label, value })
          )}
        />
      </Card>
      <Card title="How skins come into view">
        <Bars
          rows={countBy(allViews, (v) =>
            v.passThrough ? "scrolled past" : "looked at"
          ).map(([label, value]) => ({ label, value }))}
        />
      </Card>
    </Section>
  );
}

// Each candidate signal, against the outcomes that most clearly mean a skin
// landed: a download, a like, a share; and against the visit going on.
function SignalsSection({ views }: { views: View[] }) {
  const timed = views.filter((v) => v.activeMs != null);
  const rows: Array<[string, View[]]> = [
    ...[...groupBy(timed, (v) => bucketOf(DWELL_BOUNDS, v.activeMs!))]
      .sort((a, b) => DWELL_ORDER.indexOf(a[0]) - DWELL_ORDER.indexOf(b[0]))
      .map(([label, group]) => [`dwell ${label}`, group] as [string, View[]]),
    ["used Webamp", views.filter((v) => v.webampInteractions > 0)],
    ["tapped to use Webamp", views.filter((v) => v.webampUseMs != null)],
    ["didn't use Webamp", views.filter((v) => v.webampInteractions === 0)],
    ["opened the readme", views.filter((v) => v.readmeExpanded)],
    ["didn't open it", views.filter((v) => !v.readmeExpanded)],
    [
      "Webamp ready < 1s",
      views.filter((v) => v.readyMs != null && v.readyMs < 1000),
    ],
    [
      "Webamp ready ≥ 1s",
      views.filter((v) => v.readyMs != null && v.readyMs >= 1000),
    ],
  ];
  return (
    <Section
      title="Signals"
      note="What a ranking could learn from. Each row is a set of views; the columns are what followed. A signal is worth using if it separates views that end in a download, like or share from those that don't."
    >
      <Card title="Outcomes by signal" wide>
        <Table
          columns={[
            "Views",
            "Count",
            "Download",
            "Like",
            "Share",
            "Readme",
            "Webamp",
            "Session ended",
          ]}
          rows={rows.map(([label, group]) => [
            label,
            group.length.toLocaleString(),
            formatPercent(rate(group, (v) => v.downloaded)),
            formatPercent(rate(group, (v) => v.liked)),
            formatPercent(rate(group, (v) => v.shared)),
            formatPercent(rate(group, (v) => v.readmeExpanded)),
            formatPercent(rate(group, (v) => v.webampInteractions > 0)),
            formatPercent(rate(group, (v) => v.exit)),
          ])}
        />
      </Card>
      <Card
        title="Actions per view"
        note="Share of views where each happened while the skin was in view."
      >
        <Bars
          rows={[
            ["used Webamp", (v: View) => v.webampInteractions > 0],
            ["tapped to use Webamp", (v: View) => v.webampUseMs != null],
            ["opened the readme", (v: View) => v.readmeExpanded],
            ["downloaded", (v: View) => v.downloaded],
            ["liked", (v: View) => v.liked],
            ["opened share", (v: View) => v.shareOpened],
            ["shared", (v: View) => v.shared],
            ["revealed NSFW", (v: View) => v.nsfwRevealed],
          ].map(([label, test]) => ({
            label: label as string,
            value: rate(views, test as (v: View) => boolean) ?? 0,
          }))}
          format={(v) => formatPercent(v)}
        />
      </Card>
      <Card
        title="Skins with each action"
        note="Of skins viewed, the share that got it at least once."
      >
        <SkinActionShares views={views} />
      </Card>
    </Section>
  );
}

const DWELL_ORDER = histogram([], DWELL_BOUNDS, formatMs).map(
  (bin) => bin.label
);

function bucketOf(bounds: number[], value: number): string {
  const bins = histogram([value], bounds, formatMs);
  return bins.find((bin) => bin.count > 0)!.label;
}

function SkinActionShares({ views }: { views: View[] }) {
  const bySkin = [...groupBy(views, (v) => v.skinMd5).values()];
  return (
    <Bars
      rows={[
        ["downloaded", (v: View) => v.downloaded],
        ["liked", (v: View) => v.liked],
        ["shared", (v: View) => v.shared],
        ["readme opened", (v: View) => v.readmeExpanded],
      ].map(([label, test]) => ({
        label: label as string,
        value:
          rate(bySkin, (group) => group.some(test as (v: View) => boolean)) ??
          0,
      }))}
      format={(v) => formatPercent(v)}
    />
  );
}

function SourcesSection({
  views,
  impressions,
}: {
  views: View[];
  impressions: Analysis["impressions"];
}) {
  const museumViews = views.filter(
    (v) => v.query == null && v.listIndex != null
  );
  return (
    <Section
      title="Random skins and position"
      note="Random skins (version 4) are shown regardless of rank, so they're the fair comparison: how a skin does when it isn't high in the museum. Position shows how much attention comes from being near the top."
    >
      <Card title="By source" wide>
        <Table
          columns={[
            "Source",
            "Views",
            "Median dwell",
            "75th pct",
            "≥ 10s",
            "Download",
            "Like",
            "Webamp",
            "Session ended",
            "Grid impressions",
            "Tapped",
          ]}
          rows={[...groupBy(views, (v) => v.source)].map(([source, group]) => {
            const dwell = group
              .filter((v) => v.activeMs != null)
              .map((v) => v.activeMs!);
            const seen = impressions.filter((i) => i.source === source);
            return [
              source,
              group.length.toLocaleString(),
              formatMs(quantile(dwell, 0.5)),
              formatMs(quantile(dwell, 0.75)),
              formatPercent(rate(dwell, (ms) => ms >= 10_000)),
              formatPercent(rate(group, (v) => v.downloaded)),
              formatPercent(rate(group, (v) => v.liked)),
              formatPercent(rate(group, (v) => v.webampInteractions > 0)),
              formatPercent(rate(group, (v) => v.exit)),
              seen.length.toLocaleString(),
              formatPercent(rate(seen, (i) => i.clicked)),
            ];
          })}
        />
      </Card>
      <Card
        title="Museum position: median dwell"
        note="Place in the museum list. If later skins hold attention as well as early ones, position matters less than the skin."
      >
        <Bars
          rows={bucketGroups(
            museumViews.filter((v) => v.activeMs != null),
            POSITION_BOUNDS,
            (v) => v.listIndex!
          ).map(([label, group]) => ({
            label,
            value:
              quantile(
                group.map((v) => v.activeMs!),
                0.5
              ) ?? 0,
            detail: `(${group.length})`,
          }))}
          format={formatMs}
        />
      </Card>
      <Card title="Museum position: downloads">
        <Bars
          rows={bucketGroups(
            museumViews,
            POSITION_BOUNDS,
            (v) => v.listIndex!
          ).map(([label, group]) => ({
            label,
            value: rate(group, (v) => v.downloaded) ?? 0,
            detail: `(${group.length})`,
          }))}
          format={(v) => formatPercent(v)}
        />
      </Card>
    </Section>
  );
}

function CoverageSection({ views }: { views: View[] }) {
  const perSkin = [...groupBy(views, (v) => v.skinMd5).values()].map(
    (g) => g.length
  );
  const randomSkins = new Set(
    views.filter((v) => v.source === "random").map((v) => v.skinMd5)
  );
  return (
    <Section
      title="Coverage"
      note="How much there is to learn from about each skin. A per-skin signal needs several views of the skin to mean anything."
    >
      <Card title="Views per skin">
        <Histogram bins={countHistogram(perSkin, [1, 2, 3, 5, 10, 20, 50])} />
      </Card>
      <Card title="Skins with enough views">
        <Stats
          items={[
            { label: "Skins viewed", value: perSkin.length.toLocaleString() },
            {
              label: "≥ 5 views",
              value: perSkin.filter((n) => n >= 5).length.toLocaleString(),
            },
            {
              label: "≥ 20 views",
              value: perSkin.filter((n) => n >= 20).length.toLocaleString(),
            },
            {
              label: "Random skins viewed",
              value: randomSkins.size.toLocaleString(),
            },
          ]}
        />
      </Card>
    </Section>
  );
}

function GridSection({
  sessions,
  impressions,
  searches,
}: {
  sessions: Analysis["sessions"];
  impressions: Analysis["impressions"];
  searches: Analysis["searches"];
}) {
  const museum = impressions.filter((i) => i.query == null);
  const withGrid = sessions.filter((s) => s.gridImpressions > 0);
  return (
    <Section
      title="Grid"
      note="Impressions: tiles on screen for a second once scrolling stopped (version 4)."
    >
      <Card
        title="How far the grid was scrolled"
        note="Furthest position seen, per session that saw the grid."
      >
        <Histogram
          bins={countHistogram(
            withGrid.map((s) => s.maxGridPosition ?? 0),
            GRID_POSITION_BOUNDS
          )}
        />
      </Card>
      <Card
        title="Tap rate by position"
        note="Of tiles seen at each position in the museum, the share tapped."
      >
        <Bars
          rows={bucketGroups(
            museum,
            GRID_POSITION_BOUNDS,
            (i) => i.position
          ).map(([label, group]) => ({
            label,
            value: rate(group, (i) => i.clicked) ?? 0,
            detail: `(${group.length})`,
          }))}
          format={(v) => formatPercent(v)}
        />
      </Card>
      <Card title="Searches">
        <Stats
          items={[
            { label: "Searches", value: searches.length.toLocaleString() },
            {
              label: "Sessions searching",
              value: formatPercent(
                rate(sessions, (s) => s.searches > 0),
                0
              ),
            },
            {
              label: "No results",
              value: formatPercent(
                rate(searches, (s) => s.resultCount === 0),
                0
              ),
            },
            {
              label: "Taps per session",
              value:
                sessions.length === 0
                  ? "–"
                  : (
                      sessions.reduce((n, s) => n + s.gridClicks, 0) /
                      sessions.length
                    ).toFixed(2),
            },
          ]}
        />
      </Card>
      <Card title="Top searches">
        <Table
          columns={["Query", "Times", "Results"]}
          rows={countBy(searches, (s) => s.query.toLowerCase())
            .slice(0, 15)
            .map(([query, times]) => [
              query,
              times,
              searches.find((s) => s.query.toLowerCase() === query)!
                .resultCount,
            ])}
        />
      </Card>
    </Section>
  );
}

function WebampSection({
  allViews,
  sessions,
  failures,
  targets,
}: {
  allViews: View[];
  sessions: Analysis["sessions"];
  failures: number;
  targets: Map<string, number>;
}) {
  const ready = allViews
    .filter((v) => v.readyMs != null)
    .map((v) => v.readyMs!);
  return (
    <Section
      title="Webamp"
      note="Slow or broken skins get skipped for reasons that aren't their looks."
    >
      <Card
        title="Time until Webamp showed the skin"
        note="From the skin coming into view (version 4)."
      >
        <Histogram bins={histogram(ready, READY_BOUNDS, formatMs)} />
      </Card>
      <Card title="Loading and playback">
        <Stats
          items={[
            { label: "Median load", value: formatMs(quantile(ready, 0.5)) },
            {
              label: "Median time using Webamp",
              value: formatMs(
                quantile(
                  allViews
                    .filter((v) => v.webampUseMs != null)
                    .map((v) => v.webampUseMs!),
                  0.5
                )
              ),
              hint: "touch screens, version 5",
            },
            { label: "95th pct load", value: formatMs(quantile(ready, 0.95)) },
            { label: "Load failures", value: failures.toLocaleString() },
            {
              label: "Sessions that played music",
              value: formatPercent(
                rate(sessions, (s) => s.playedAudio),
                0
              ),
            },
          ]}
        />
      </Card>
      <Card title="What was pressed" note="The first press per view.">
        <Bars rows={[...targets].map(([label, value]) => ({ label, value }))} />
      </Card>
    </Section>
  );
}

function LeavingSection({
  sessions,
  linkClicks,
  switches,
}: {
  sessions: Analysis["sessions"];
  linkClicks: Analysis["linkClicks"];
  switches: Analysis["viewSwitches"];
}) {
  return (
    <Section title="Moving around">
      <Card title="Switching between grid and feed">
        <Bars
          rows={countBy(switches, (s) => `to ${s.to} via ${s.via}`).map(
            ([label, value]) => ({ label, value })
          )}
        />
      </Card>
      <Card title="Links followed out" note="Version 4. New tab marked.">
        <Bars
          rows={countBy(
            linkClicks,
            (l) => `${l.href}${l.newTab ? " (new tab)" : ""}`
          )
            .slice(0, 12)
            .map(([label, value]) => ({ label, value }))}
          total={sessions.length}
        />
      </Card>
    </Section>
  );
}

function TopSkinsSection({ views }: { views: View[] }) {
  const rows = [...groupBy(views, (v) => v.skinMd5)]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 20);
  return (
    <Section title="Most viewed skins" note="Raw counts, not a ranking.">
      <Card title="Top 20 by views" wide>
        <Table
          columns={[
            "Skin",
            "Views",
            "Random",
            "Median dwell",
            "Downloads",
            "Likes",
            "Ended here",
          ]}
          rows={rows.map(([md5, group]) => [
            <span key="skin" className="skin-cell">
              <img src={screenshotUrlFromHash(md5)} alt="" className="thumb" />
              <a href={`/skin/${md5}`} className="mono">
                {md5.slice(0, 8)}
              </a>
            </span>,
            group.length,
            group.filter((v) => v.source === "random").length,
            formatMs(
              quantile(
                group.filter((v) => v.activeMs != null).map((v) => v.activeMs!),
                0.5
              )
            ),
            group.filter((v) => v.downloaded).length,
            group.filter((v) => v.liked).length,
            group.filter((v) => v.exit).length,
          ])}
        />
      </Card>
    </Section>
  );
}

function QualitySection({
  all,
  sessions,
  botCounts,
  total,
}: {
  all: Analysis;
  sessions: Analysis["sessions"];
  // Sessions caught by each rule, of `total` (before the Traffic filter).
  botCounts: Map<string, number>;
  total: number;
}) {
  return (
    <Section title="Data quality">
      <Card
        title="Suspected bots"
        note="Sessions matching any of these are left out unless Traffic says otherwise. Of all sessions in the period, before that filter."
        wide
      >
        <Table
          columns={["Rule", "Sessions", "What it means"]}
          rows={Object.entries(BOT_REASONS).map(([reason, meaning]) => [
            reason,
            `${(botCounts.get(reason) ?? 0).toLocaleString()} · ${formatPercent(
              total === 0 ? null : (botCounts.get(reason) ?? 0) / total,
              0
            )}`,
            <span key="meaning" className="wrap">
              {meaning}
            </span>,
          ])}
        />
      </Card>
      <Card title="Gaps">
        <Stats
          items={[
            {
              label: "Sessions missing events",
              value: formatPercent(rate(sessions, (s) => s.lostEvents > 0)),
              hint: "gaps in seq",
            },
            {
              label: "No session_end",
              value: formatPercent(rate(sessions, (s) => !s.hasEnd)),
              hint: "discarded in the background",
            },
            {
              label: "Views never ended",
              value: all.unendedViews.toLocaleString(),
            },
            {
              label: "Median send delay",
              value: formatMs(quantile(all.clockSkews, 0.5)),
              hint: "server time − client time",
            },
          ]}
        />
      </Card>
      <Card title="Versions">
        <Bars
          rows={countBy(sessions, (s) => `version ${s.version}`).map(
            ([label, value]) => ({ label, value })
          )}
        />
      </Card>
      <Card title="Events by type" wide>
        <Bars
          rows={[...all.eventCounts]
            .sort((a, b) => b[1] - a[1])
            .map(([label, value]) => ({ label, value }))}
        />
      </Card>
    </Section>
  );
}

type Analysis = ReturnType<typeof analyze>;
