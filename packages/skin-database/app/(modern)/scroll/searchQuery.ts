import parseQuery from "../../../legacy-client/src/queryParser";

// A search's words, and the Algolia filters asked for by its has:/filter:
// terms (e.g. has:ani, -filter:nsfw; see legacy-client/src/queryParser.js).
// Algolia applies them; our SQLite search (the fallback, and the server's
// render of a search link) can only apply the NSFW one, and ignores the rest.
export type ParsedSearch = {
  text: string;
  options: { filters?: string; numericFilters?: string };
  // Whether it uses that syntax at all (including terms for attributes the
  // parser doesn't know, which it drops).
  hasSyntax: boolean;
};

export function parseSearch(query: string): ParsedSearch {
  const [text, options] = parseQuery(query);
  return { text: text.trim(), options, hasSyntax: text !== query };
}

// The filters the search box's filters menu offers (see Grid.tsx), in
// groups, as toggles. The menu shows their names; their has: terms show up in
// the search box as they're picked. has:likes is left out: nearly every skin has a like. So are the
// NSFW ones (filter:nsfw, -filter:nsfw), which work if typed.
export const SEARCH_FILTER_GROUPS: ReadonlyArray<{
  label: string;
  filters: ReadonlyArray<{ filter: string; label: string }>;
}> = [
  {
    label: "Windows",
    filters: [
      { filter: "has:playlist", label: "Playlist" },
      { filter: "has:equalizer", label: "Equalizer" },
      { filter: "has:browser", label: "Minibrowser" },
      { filter: "has:media", label: "Media library" },
      { filter: "has:video", label: "Video" },
      { filter: "has:general", label: "General" },
    ],
  },
  {
    label: "Plugins",
    filters: [
      { filter: "has:mikro", label: "MikroAMP" },
      { filter: "has:vidamp", label: "Vidamp" },
      { filter: "has:avs", label: "AVS" },
    ],
  },
  {
    label: "Cursors",
    filters: [
      { filter: "has:cur", label: "Custom cursors" },
      { filter: "has:ani", label: "Animated cursors" },
    ],
  },
  {
    label: "Other",
    filters: [{ filter: "has:transparency", label: "Transparent" }],
  },
];

/** Whether the search has this filter (e.g. "has:ani") as one of its terms. */
export function hasFilter(query: string, filter: string): boolean {
  return query.split(/\s+/).includes(filter);
}

/** The search with this filter added (at the end) or taken out. */
export function toggleFilter(
  query: string,
  filter: string,
  on: boolean
): string {
  const terms = query.split(/\s+/).filter((term) => term !== "");
  if (!on) return terms.filter((term) => term !== filter).join(" ");
  return hasFilter(query, filter) ? query : [...terms, filter].join(" ");
}
