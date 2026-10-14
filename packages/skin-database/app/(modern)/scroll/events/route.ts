import { logUserEvent } from "../Events";

// Endpoint for `navigator.sendBeacon`, which is the only reliable way to send
// an event while the page is unloading. Server actions are plain fetches and
// get cancelled when the page goes away.
//
// Only `session_end` is accepted. Everything else goes through the
// `logUserEvent` server action.
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const { sessionId, event } = body ?? {};
  if (
    typeof sessionId !== "string" ||
    event?.type !== "session_end" ||
    event.reason !== "before_unload"
  ) {
    return new Response(null, { status: 400 });
  }
  await logUserEvent(sessionId, { type: "session_end", reason: event.reason });
  return new Response(null, { status: 204 });
}
