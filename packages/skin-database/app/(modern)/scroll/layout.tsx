"use client";

import { ReactNode } from "react";
import BottomMenuBar from "./BottomMenuBar";
import "./scroll.css";

type LayoutProps = {
  children: ReactNode;
};

export default function LayoutWrapper({ children }: LayoutProps) {
  return (
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
      <BottomMenuBar />
    </div>
  );
}
