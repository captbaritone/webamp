// Public URLs for the museum's pages. The new UI's routes live under /scroll,
// and middleware.ts maps these onto them.

// A skin: /skin/:md5/:fileName (also what the sitemap lists). A permalink:
// which list the feed was showing it in isn't part of it (see listPosition.ts).
export function skinPath(md5: string, fileName: string): string {
  return `/skin/${md5}/${encodeURIComponent(fileName)}`;
}

// The grid, showing the museum ("") or a search.
export function gridPath(query: string): string {
  return query === "" ? "/" : `/?${new URLSearchParams({ query })}`;
}
