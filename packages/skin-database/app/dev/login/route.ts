import { NextResponse, type NextRequest } from "next/server";
import {
  DEV_ACCESS_COOKIE,
  DEV_ACCESS_MAX_AGE,
  isDevToken,
} from "../devAccess";

// Sign in to the /dev pages in production (see devAccess.ts). The token is
// posted from a form rather than passed in the URL, so it stays out of the
// server's access logs and the browser's history.

const FORM = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<meta name="robots" content="noindex">
<title>Sign in</title>
<form method="post" style="font: 14px system-ui; margin: 4em auto; max-width: 20em">
  <input type="text" name="username" value="dev" autocomplete="username" hidden>
  <label>Token<br>
    <input type="password" name="token" autocomplete="current-password" autofocus required style="width: 100%">
  </label>
  <p><button>Sign in</button></p>
</form>`;

export function GET() {
  return new NextResponse(FORM, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const token = form.get("token");
  if (typeof token !== "string" || !isDevToken(token)) {
    return new NextResponse("Not Found", { status: 404 });
  }
  // A relative redirect: behind the proxy, request.url's host is localhost.
  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: "/dev/events" },
  });
  response.cookies.set(DEV_ACCESS_COOKIE, token, {
    path: "/dev",
    maxAge: DEV_ACCESS_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return response;
}
