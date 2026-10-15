import SessionModel from "../../../../data/SessionModel";
import { getClientSkins, getInitialClientSkins } from "../getClientSkins";
import SkinScroller from "../SkinScroller";

// Ensure each page load gets a new session
export const dynamic = "force-dynamic";

/**
 * A tik-tok style scroll page where we display one skin at a time in full screen
 */
export default async function ScrollPage() {
  // Nothing is written for the session until the browser reports in.
  const sessionId = SessionModel.newId();
  const initialSkins = await getInitialClientSkins(sessionId);

  return (
    <SkinScroller
      initialSkins={initialSkins}
      getSkins={getClientSkins}
      sessionId={sessionId}
    />
  );
}
