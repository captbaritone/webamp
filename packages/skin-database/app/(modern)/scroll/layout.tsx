"use client";

import { ReactNode } from "react";
import BottomMenuBar from "./BottomMenuBar";
import "./scroll.css";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
      }}
    >
      {children}
      <BottomMenuBar />
    </div>
  );
}
