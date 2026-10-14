"use client";

import { useEffect } from "react";
import { useStore } from "react-redux";
import { syncUrlToStore } from "../../legacy-client/src/redux/store";

/**
 * Next.js client-side navigation into the legacy app (e.g. the Upload button
 * in /scroll) doesn't fire popstate, so the legacy store never learns the URL
 * changed. Sync it whenever the legacy layout mounts.
 */
export default function LegacyUrlSync() {
  const store = useStore();
  useEffect(() => {
    syncUrlToStore(store);
  }, [store]);
  return null;
}
