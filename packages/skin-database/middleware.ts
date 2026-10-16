import { NextResponse, type NextRequest } from "next/server";
import { DEV_ACCESS_COOKIE, hasDevAccess } from "./app/dev/devAccess";

// Which UI the museum's public URLs serve:
//
// - "new": the grid and feed in app/(modern)/scroll (the default)
// - "classic": the original app in app/(legacy)
//
// Read per request from MUSEUM_UI, so going back to the classic UI is a
// restart, not a rebuild (see `scripts/deploy.sh --classic`). Both UIs ship in
// every build until the classic one is removed.
//
// A visitor can override it for themselves (e.g. to try the new UI before
// it's the default) with ?ui=new or ?ui=classic on any of these URLs, which
// sets a cookie; ?ui=default clears it.
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

const UI_COOKIE = "museum_ui";
const UI_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function chosenUi(request: NextRequest): "new" | "classic" {
  const override = request.cookies.get(UI_COOKIE)?.value;
  if (override === "new" || override === "classic") return override;
  return process.env.MUSEUM_UI === "classic" ? "classic" : "new";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The /dev pages are private in production (see app/dev/devAccess.ts). A
  // plain 404 for anyone else, so they don't show there's anything here.
  if (pathname === "/dev" || pathname.startsWith("/dev/")) {
    if (
      pathname === "/dev/login" ||
      hasDevAccess(request.cookies.get(DEV_ACCESS_COOKIE)?.value)
    ) {
      return NextResponse.next();
    }
    return new NextResponse("Not Found", { status: 404 });
  }

  // ?ui=new|classic|default: set (or clear) this visitor's override, then
  // reload the same URL without the parameter.
  const ui = request.nextUrl.searchParams.get("ui");
  if (ui === "new" || ui === "classic" || ui === "default") {
    const url = request.nextUrl.clone();
    url.searchParams.delete("ui");
    const response = NextResponse.redirect(url, 307);
    if (ui === "default") {
      response.cookies.delete(UI_COOKIE);
    } else {
      response.cookies.set(UI_COOKIE, ui, {
        path: "/",
        maxAge: UI_COOKIE_MAX_AGE,
        sameSite: "lax",
      });
    }
    return response;
  }

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

  if (chosenUi(request) === "classic") {
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
  // Only the paths above and /dev (keeps the middleware off assets, /graphql, etc.).
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
    "/dev",
    "/dev/:path*",
  ],
};
