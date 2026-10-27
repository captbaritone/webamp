"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { notePathname } from "./gridReturn";
import FloatingBar from "./FloatingBar";
import BackButton from "./BackButton";
import "./scroll.css";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  useEffect(() => {
    notePathname(pathname);
  }, [pathname]);
  return (
    <div
      style={{
        position: "relative",
        height: "100dvh",
      }}
    >
      {children}
      {/* The grid has its own, with its search box in the middle. */}
      {pathname !== "/" && (
        <FloatingBar>
          <BackButton />
        </FloatingBar>
      )}
    </div>
  );
}
