import { redirect } from "next/navigation";
import { getMuseumPageSkins } from "../getMuseumPageSkins";
import { skinPath } from "../paths";

// The museum's top skin can change.
export const dynamic = "force-dynamic";

/**
 * /feed: the feed, from the top of the museum. The feed is a view of the
 * grid's lists rather than a list of its own, so this just opens the museum's
 * first skin.
 */
export default async function Feed() {
  const [first] = await getMuseumPageSkins(0, 1);
  redirect(first == null ? "/" : skinPath(first.md5, first.fileName));
}
