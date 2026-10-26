// The search debounce is the main lever we have on how much search traffic
// actually reaches Algolia (or the server, when it answers instead), so it's worth being able to turn it without a
// deploy. Building this app needs ~2GB of heap, which the server can only just
// manage, so a rebuild is the expensive way to change a number.
//
// Instead the value is read from the environment at request time (see
// app/layout.tsx) and handed to the client, which means tuning it is a
// `systemctl restart`, not a rebuild.

export const DEFAULT_SEARCH_DEBOUNCE_MS = 400;

// Below ~50ms the debounce isn't doing anything; above a couple of seconds the
// search feels broken. Anything outside that is more likely a typo in the
// service config than an intent, so we clamp rather than honor it.
const MIN_SEARCH_DEBOUNCE_MS = 50;
const MAX_SEARCH_DEBOUNCE_MS = 2000;

let searchDebounceMs = DEFAULT_SEARCH_DEBOUNCE_MS;

/**
 * Parse a debounce value as it arrives from the environment. Returns null for
 * anything unusable, so a bad value falls back to the default instead of
 * disabling search.
 */
export function parseSearchDebounceMs(raw) {
  if (raw == null || raw === "") {
    return null;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return Math.min(
    MAX_SEARCH_DEBOUNCE_MS,
    Math.max(MIN_SEARCH_DEBOUNCE_MS, Math.round(parsed))
  );
}

export function setSearchDebounceMs(value) {
  if (value != null) {
    searchDebounceMs = value;
  }
}

export function getSearchDebounceMs() {
  return searchDebounceMs;
}
