import { Metadata } from "next";
import SessionModel from "../../../../../data/SessionModel";
import { getClientSkins, getInitialClientSkins } from "../../getClientSkins";
import SkinScroller from "../../SkinScroller";
import { generateSkinPageMetadata } from "../../../../(legacy)/skin/[hash]/skinMetadata";

export async function generateMetadata({ params }): Promise<Metadata> {
  const { md5 } = await params;
  return generateSkinPageMetadata(md5);
}

// Ensure each page load gets a new session
export const dynamic = "force-dynamic";

export default async function Skin({ params }) {
  const { md5 } = await params;

  // Nothing is written for the session until the browser reports in.
  const sessionId = SessionModel.newId();
  const initialSkins = await getInitialClientSkins(sessionId, md5);

  return (
    <SkinScroller
      initialSkins={initialSkins}
      getSkins={getClientSkins}
      sessionId={sessionId}
      landedOnSkin
    />
  );
}
