"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { returnToGrid } from "./gridReturn";
import { gridPath } from "./paths";
import { useListPosition } from "./listPosition";
import { isModifiedClick } from "./BottomMenuBar";

// Shown to the left of each skin's title in the feed.
export default function BackToGrid() {
  const router = useRouter();
  const position = useListPosition();
  return (
    <Link
      href={gridPath(position?.query ?? "")}
      className="skin-back"
      aria-label="Back to grid"
      title="Back to grid"
      onClick={(e) => {
        if (isModifiedClick(e)) return;
        e.preventDefault();
        returnToGrid(router);
      }}
    >
      <ArrowLeft size={22} aria-hidden />
    </Link>
  );
}
