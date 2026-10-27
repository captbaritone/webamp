"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { MOBILE_MAX_WIDTH } from "../../../legacy-client/src/constants";
import MuseumMenu, { isModifiedClick } from "./MuseumMenu";

type Props = {
  // In place of going to the grid, e.g. on the grid itself.
  onLogoClick?: () => void;
  // Between the logo and the "…" menu: the grid's search box, or elsewhere a
  // way back (see BackButton.tsx).
  children: ReactNode;
};

// The bar floating at the bottom of every page: the museum's logo, then
// `children`, then the "…" menu. Pages leave room for it via
// --floating-bar-space.
export default function FloatingBar({ onLogoClick, children }: Props) {
  return (
    <div className="floating-bar" style={{ maxWidth: MOBILE_MAX_WIDTH }}>
      <Link
        href="/"
        className="floating-bar-logo"
        aria-label="Winamp Skin Museum"
        title="Winamp Skin Museum"
        onClick={(e) => {
          if (onLogoClick == null || isModifiedClick(e)) return;
          e.preventDefault();
          onLogoClick();
        }}
      >
        {/* The museum's logo, as in the legacy site's header. */}
        <span className="floating-bar-logo-mark" aria-hidden>
          🌩️
        </span>
      </Link>
      {children}
      <MuseumMenu />
    </div>
  );
}
