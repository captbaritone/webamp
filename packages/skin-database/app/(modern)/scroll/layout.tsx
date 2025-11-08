"use client";

import { ReactNode, createContext, useContext } from "react";
import BottomMenuBar from "./BottomMenuBar";

type SessionContextType = {
  sessionId: string | null;
};

const SessionContext = createContext<SessionContextType>({ sessionId: null });

export function useSession() {
  return useContext(SessionContext);
}

type LayoutWrapperProps = {
  children: ReactNode;
  sessionId: string;
};

export function LayoutWrapper({ children, sessionId }: LayoutWrapperProps) {
  return (
    <SessionContext.Provider value={{ sessionId }}>
      <div
        style={{
          position: "relative",
          width: "100vw",
          maxWidth: "56.25vh", // 9:16 aspect ratio (100vh * 9/16)
          margin: "0 auto",
          height: "100vh",
        }}
      >
        {children}
        <BottomMenuBar sessionId={sessionId} />
      </div>
    </SessionContext.Provider>
  );
}

type Props = {
  children: ReactNode;
};

export default function ScrollLayout({ children }: Props) {
  return <>{children}</>;
}
