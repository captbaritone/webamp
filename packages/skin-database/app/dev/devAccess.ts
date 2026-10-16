// Who may see the pages under /dev (the event dashboard). In development,
// anyone: it's your own machine. In production, only a browser holding the
// cookie set by signing in at /dev/login with DEV_DASHBOARD_TOKEN (set in
// .env.production.local on the server). With no token configured, nobody.
//
// Used by both the middleware and the pages themselves, so a page that the
// middleware's matcher somehow misses still refuses. Runs in the middleware's
// edge runtime, so no Node APIs.

export const DEV_ACCESS_COOKIE = "dev_access";

// A year: you sign in once per browser.
export const DEV_ACCESS_MAX_AGE = 60 * 60 * 24 * 365;

// Short tokens would be guessable; refuse to use one.
const MIN_TOKEN_LENGTH = 32;

function configuredToken(): string | null {
  const token = process.env.DEV_DASHBOARD_TOKEN;
  return token != null && token.length >= MIN_TOKEN_LENGTH ? token : null;
}

/** Whether `candidate` is the configured token. */
export function isDevToken(candidate: string | null | undefined): boolean {
  const token = configuredToken();
  if (token == null || candidate == null) return false;
  // Compare every character regardless of where they first differ, so the
  // time taken doesn't hint at how much of a guess was right.
  let diff = candidate.length ^ token.length;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ (candidate.charCodeAt(i) || 0);
  }
  return diff === 0;
}

/** Whether a request with this /dev access cookie may see /dev pages. */
export function hasDevAccess(cookie: string | null | undefined): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return isDevToken(cookie);
}
