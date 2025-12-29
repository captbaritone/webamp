"use client";

// @ts-expect-error - unstable_ViewTransition is not yet in @types/react
import { unstable_ViewTransition as ViewTransition, ReactNode } from "react";
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
      <ViewTransition name="footer">
        <BottomMenuBar />
      </ViewTransition>
    </div>
  );
}
