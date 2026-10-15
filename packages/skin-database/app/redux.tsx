"use client";
import { Provider } from "react-redux";
import { createStore } from "../legacy-client/src/redux/store";
import { setSearchDebounceMs } from "../legacy-client/src/searchConfig";
import { useEffect, useState } from "react";

/**
 * The classic museum's Redux store. Only the classic UI's layout uses this:
 * creating the store starts fetching museum data, which the new UI doesn't
 * need.
 */
export default function ReduxContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store, setStore] = useState<any>(null);

  // Store creation currently fails on the server, so we delay and only create
  // the store on mount for now.
  useEffect(() => {
    setStore(createStore());
    // Deliberately not reacting to later changes: the store is created once.
  }, []);
  if (store == null) {
    return null;
  }
  return <Provider store={store}>{children}</Provider>;
}

/**
 * Applies the search debounce (resolved on the server per request, so it can
 * be changed with a restart rather than a rebuild) for both UIs' search. Null
 * means "use the default".
 */
export function SearchDebounceConfig({
  searchDebounceMs,
}: {
  searchDebounceMs: number | null;
}) {
  // During render rather than in an effect, so it's set before anything
  // below can start a search.
  setSearchDebounceMs(searchDebounceMs);
  return null;
}
