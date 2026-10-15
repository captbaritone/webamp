import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { feedSkinExists } from "../../getMuseumPageSkins";

/**
 * Checks the skin exists before anything is sent, so a missing one gets a 404
 * status. The page can't: loading.tsx starts streaming the response (with a
 * 200) before the page renders.
 */
export default async function SkinLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ md5: string }>;
}) {
  const { md5 } = await params;
  if (!(await feedSkinExists(md5))) notFound();
  return children;
}
