"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { ArrowLeft, Grid3x3 } from "lucide-react";
import {
  goBack,
  previousPageInTab,
  returnToGrid,
  subscribeToPreviousPage,
} from "./gridReturn";
import { gridPath } from "./paths";
import { useListPosition } from "./listPosition";
import { isModifiedClick } from "./MuseumMenu";

// In the floating bar on every page but the grid, in place of its search box.
// Back to the page you came from, if you came from one here. Otherwise (say,
// you followed a link to this page) on into the grid.
export default function BackButton() {
  const router = useRouter();
  const position = useListPosition();
  const previousPage = useSyncExternalStore(
    subscribeToPreviousPage,
    previousPageInTab,
    // The server can't know, and a page it renders is usually where the
    // visitor arrived.
    () => null
  );

  if (previousPage != null) {
    return (
      <button
        type="button"
        className="floating-bar-back"
        onClick={() => goBack(router)}
      >
        <ArrowLeft size={18} aria-hidden />
        Back
      </button>
    );
  }

  return (
    <Link
      href={gridPath(position?.query ?? "")}
      className="floating-bar-back"
      onClick={(e) => {
        if (isModifiedClick(e)) return;
        e.preventDefault();
        returnToGrid(router);
      }}
    >
      <Grid3x3 size={18} aria-hidden />
      Browse skins
    </Link>
  );
}
