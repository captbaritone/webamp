import { NextResponse, type NextRequest } from "next/server";

// Which UI the museum's public URLs serve:
//
// - "new": the grid and feed in app/(modern)/scroll (the default)
// - "classic": the original app in app/(legacy)
//
// Read per request from MUSEUM_UI, so going back to the classic UI is a
// restart, not a rebuild (see `scripts/deploy.sh --classic`). Both UIs ship in
// every build until the classic one is removed.
//
// The new UI's routes live under /scroll, where it was developed; this maps
// the public URLs onto them. Paths it doesn't map (upload, review, a skin's
// debug and file views, ...) always get the classic app.

const MD5 = "[0-9a-f]{32}";

// URL -> the new UI's route for it.
const NEW_UI_ROUTES: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
  [/^\/$/, () => "/scroll"],
  [/^\/feed\/?$/, () => "/scroll/skin"],
  // /skin/:md5, /skin/:md5/:fileName (the sitemap's form) and
  // /skin/:md5/:fileName/null (left by an old client bug).
  [
    new RegExp(`^/skin/(${MD5})(?:/(?!debug(?:/|$))[^/]+(?:/null)?)?/?$`),
    (m) => `/scroll/skin/${m[1]}`,
  ],
  [/^\/about\/?$/, () => "/scroll/about"],
  [/^\/feedback\/?$/, () => "/scroll/feedback"],
];

// Old URL -> where it lives now, regardless of UI: the /scroll experiment's
// URLs (which were shared) and /index.html.
const REDIRECTS: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
  [/^\/index\.html$/, () => "/"],
  [/^\/scroll\/?$/, () => "/"],
  [/^\/scroll\/skin\/?$/, () => "/feed"],
  [new RegExp(`^/scroll/skin/(${MD5})/?$`), (m) => `/skin/${m[1]}`],
  [/^\/scroll\/about\/?$/, () => "/about"],
  [/^\/scroll\/feedback\/?$/, () => "/feedback"],
];

function lookup(
  table: Array<[RegExp, (match: RegExpMatchArray) => string]>,
  pathname: string
): string | null {
  for (const [pattern, target] of table) {
    const match = pathname.match(pattern);
    if (match != null) return target(match);
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const redirectTo = lookup(REDIRECTS, pathname);
  if (redirectTo != null) {
    const url = request.nextUrl.clone();
    url.pathname = redirectTo;
    // The experiment's grid searched with ?q=; the museum uses ?query=.
    const q = url.searchParams.get("q");
    if (q != null) {
      url.searchParams.delete("q");
      url.searchParams.set("query", q);
    }
    return NextResponse.redirect(url, 308);
  }

  if (process.env.MUSEUM_UI === "classic") {
    return NextResponse.next();
  }

  const route = lookup(NEW_UI_ROUTES, pathname);
  if (route == null) {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  url.pathname = route;
  return NextResponse.rewrite(url);
}

export const config = {
  // Only the paths above (keeps the middleware off assets, /graphql, etc.).
  matcher: [
    "/",
    "/index.html",
    "/feed",
    "/about",
    "/feedback",
    "/skin/:path*",
    "/scroll",
    "/scroll/skin/:path*",
    "/scroll/about",
    "/scroll/feedback",
  ],
};
