import SessionModel from "../../../data/SessionModel";
import { getClientSkins } from "./getClientSkins";
import SkinScroller from "./SkinScroller";

// Ensure each page load gets a new session
export const dynamic = "force-dynamic";

/**
 * A tik-tok style scroll page where we display one skin at a time in full screen
 */
export default async function ScrollPage() {
  // Create the session in the database
  const sessionId = await SessionModel.create();

  const initialSkins = await getClientSkins(sessionId);

  return (
    <SkinScroller
      initialSkins={initialSkins}
      getSkins={getClientSkins}
      sessionId={sessionId}
    />
  );
}
