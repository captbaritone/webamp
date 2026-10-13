"use client";
import { Provider } from "react-redux";
import { createStore } from "../legacy-client/src/redux/store";
import { setSearchDebounceMs } from "../legacy-client/src/searchConfig";
import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  // Resolved on the server per request, so it can be changed with a restart
  // rather than a rebuild. Null means "use the default".
  searchDebounceMs?: number | null;
};

export default function ReduxContextProvider({
  children,
  searchDebounceMs = null,
}: Props) {
  const [store, setStore] = useState<any>(null);

  // Store creation currently fails on the server, so we delay and only create
  // the store on mount for now.
  useEffect(() => {
    setSearchDebounceMs(searchDebounceMs);
    const store = createStore();
    setStore(store);
    // Deliberately not reacting to later changes: the store is created once.
  }, []);
  if (store == null) {
    return null;
  }
  return <Provider store={store}>{children}</Provider>;
}
