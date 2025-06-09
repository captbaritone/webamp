"use client";
import { Provider } from "react-redux";
import { createStore } from "../legacy-client/src/redux/store";
import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
};

export default function ReduxContextProvider({ children }: Props) {
  const [store, setStore] = useState<any>(null);

  // Store creation currently fails on the server, so we delay and only create
  // the store on mount for now.
  useEffect(() => {
    const store = createStore();
    setStore(store);
  }, []);
  if (store == null) {
    return null;
  }
  return <Provider store={store}>{children}</Provider>;
}
