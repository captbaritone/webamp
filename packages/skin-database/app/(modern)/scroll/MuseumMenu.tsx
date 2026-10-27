"use client";

import {
  Info,
  Ellipsis,
  MessageSquare,
  Upload,
  Github,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useEventLogger } from "./eventLogger";
import { useState, useEffect, useRef } from "react";

// Where "Donate" goes: thank-you donations. Following it is
// logged as a link_click with this href, like the menu's other links.
const DONATION_URL = "https://ko-fi.com/jordaneldredge";

// The "…" menu, at the right of the floating bar (see FloatingBar.tsx).
export default function MuseumMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const logger = useEventLogger();
  const toggleMenu = () => {
    if (!isMenuOpen) logger.log({ type: "menu_open" });
    setIsMenuOpen(!isMenuOpen);
  };
  const closeMenu = () => setIsMenuOpen(false);

  // Close the menu on a click outside it, or on Escape.
  useEffect(() => {
    if (!isMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      // Let the toggle button handle its own clicks. Otherwise this closes the
      // menu on mousedown and the button's click immediately reopens it.
      if (target.closest("[data-menu-toggle]")) {
        return;
      }
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setIsMenuOpen(false);
      toggleRef.current?.focus();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <div className="floating-menu-anchor">
      {isMenuOpen && (
        <nav
          id="floating-menu-popover"
          className="floating-menu-popover"
          ref={menuRef}
          aria-label="More"
        >
          <MenuItem
            href="/about"
            icon={<Info size={18} />}
            label="About"
            onClick={closeMenu}
          />
          <MenuItem
            href="/upload"
            icon={<Upload size={18} />}
            label="Upload"
            onClick={closeMenu}
          />
          <MenuItem
            href="/feedback"
            icon={<MessageSquare size={18} />}
            label="Feedback"
            onClick={closeMenu}
          />
          <MenuItem
            href={DONATION_URL}
            icon={<Heart size={18} />}
            label="Donate"
            onClick={closeMenu}
            external
          />
          <MenuItem
            href="https://github.com/captbaritone/webamp/"
            icon={<Github size={18} />}
            label="GitHub"
            onClick={closeMenu}
            external
          />
        </nav>
      )}
      <button
        ref={toggleRef}
        type="button"
        className="floating-menu-button"
        data-menu-toggle
        aria-label="More"
        title="More"
        aria-expanded={isMenuOpen}
        aria-controls="floating-menu-popover"
        onClick={toggleMenu}
      >
        <Ellipsis size={20} aria-hidden />
      </button>
    </div>
  );
}

// A click meant for the browser, e.g. to open the link in a new tab.
export function isModifiedClick(e: React.MouseEvent): boolean {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}

type MenuItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  external?: boolean;
};

function MenuItem({
  href,
  icon,
  label,
  onClick,
  external = false,
}: MenuItemProps) {
  const content = (
    <>
      {icon}
      <span>{label}</span>
    </>
  );

  if (external) {
    return (
      <a
        className="floating-menu-item"
        href={href}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link className="floating-menu-item" href={href} onClick={onClick}>
      {content}
    </Link>
  );
}
