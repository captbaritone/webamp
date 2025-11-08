import SessionModel from "../../../../../data/SessionModel";
import UserContext from "../../../../../data/UserContext";
import { getClientSkins, getSkinForSession } from "../../getClientSkins";
import SkinScroller from "../../SkinScroller";

// Ensure each page load gets a new session
export const dynamic = "force-dynamic";

export default async function Skin({ params }) {
  const { md5 } = await params;

  // Create the session in the database
  const sessionId = await SessionModel.create();

  const ctx = new UserContext();
  const linked = await getSkinForSession(ctx, sessionId, md5);
  const initialSkins = await getClientSkins(sessionId);

  return (
    <SkinScroller
      initialSkins={[linked, ...initialSkins]}
      getSkins={getClientSkins}
      sessionId={sessionId}
    />
  );
}
