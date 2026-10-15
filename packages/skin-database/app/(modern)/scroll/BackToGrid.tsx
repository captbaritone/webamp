"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { returnToGrid } from "./gridReturn";

// Shown to the left of each skin's title in the feed.
export default function BackToGrid() {
  const router = useRouter();
  return (
    <Link
      href="/"
      className="skin-back"
      aria-label="Back to grid"
      title="Back to grid"
      onClick={(e) => {
        // Let modified clicks (e.g. open in a new tab) through.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        returnToGrid(router);
      }}
    >
      <ArrowLeft size={22} aria-hidden />
    </Link>
  );
}
