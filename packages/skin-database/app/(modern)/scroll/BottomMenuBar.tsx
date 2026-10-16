"use client";

import {
  Smartphone,
  Info,
  Grid3x3,
  Menu,
  MessageSquare,
  Upload,
  Github,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { setNextViewVia, useEventLogger } from "./eventLogger";
import { notePathname, returnToGrid } from "./gridReturn";
import { gridPath, skinPath } from "./paths";
import { useListPosition } from "./listPosition";
import { MOBILE_MAX_WIDTH } from "../../../legacy-client/src/constants";
import {
  // @ts-expect-error - unstable_ViewTransition is not yet in @types/react
  unstable_ViewTransition as ViewTransition,
  useState,
  useEffect,
  useRef,
} from "react";

// Where "Support the museum" goes: thank-you donations. Following it is
// logged as a link_click with this href, like the menu's other links.
const DONATION_URL = "https://ko-fi.com/jordaneldredge";

export default function BottomMenuBar() {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Publish our height so overlays (like the expanded readme) can sit right on
  // top of the bar.
  useEffect(() => {
    const bar = barRef.current;
    if (bar == null) return;
    const root = document.documentElement;
    const publish = () =>
      root.style.setProperty(
        "--bottom-nav-height",
        `${bar.getBoundingClientRect().height}px`
      );
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(bar);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--bottom-nav-height");
    };
  }, []);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    notePathname(pathname);
  }, [pathname]);
  // The grid and the feed open on the skin you were last on in either.
  const position = useListPosition();
  const onFeed = pathname.startsWith("/skin/");

  const logger = useEventLogger();
  const toggleHamburger = () => {
    if (!isHamburgerOpen) logger.log({ type: "menu_open" });
    setIsHamburgerOpen(!isHamburgerOpen);
  };

  // Close hamburger menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      // Let the toggle button handle its own clicks. Otherwise this closes the
      // menu on mousedown and the button's click immediately reopens it.
      if (target.closest("[data-hamburger-toggle]")) {
        return;
      }
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsHamburgerOpen(false);
      }
    }

    if (isHamburgerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isHamburgerOpen]);

  return (
    <>
      {/* Hamburger Menu Overlay */}
      {isHamburgerOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "4.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: MOBILE_MAX_WIDTH,
            backgroundColor: "rgba(26, 26, 26, 0.98)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderBottom: "none",
            boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.3)",
            zIndex: 999,
          }}
        >
          <div ref={menuRef}>
            <HamburgerMenuItem
              href="/about"
              icon={<Info size={20} />}
              label="About"
              onClick={() => {
                setIsHamburgerOpen(false);
              }}
            />
            <HamburgerMenuItem
              href="/feedback"
              icon={<MessageSquare size={20} />}
              label="Feedback"
              onClick={() => {
                setIsHamburgerOpen(false);
              }}
            />
            <HamburgerMenuItem
              href={DONATION_URL}
              icon={<Heart size={20} />}
              label="Support the museum"
              onClick={() => {
                setIsHamburgerOpen(false);
              }}
              external
            />
            <HamburgerMenuItem
              href="https://github.com/captbaritone/webamp/"
              icon={<Github size={20} />}
              label="GitHub"
              onClick={() => {
                setIsHamburgerOpen(false);
              }}
              external
            />
          </div>
        </div>
      )}

      {/* Bottom Menu Bar */}
      <div
        ref={barRef}
        style={{
          // Fixed, not sticky: sticky leaves it right after the content, which
          // while a page is loading is at the top of the screen. Pages leave
          // room for it via --bottom-nav-height.
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(26, 26, 26, 0.95)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "0.75rem 0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: MOBILE_MAX_WIDTH, // Match the scroll page max width
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <MenuButton
            href={gridPath(position?.query ?? "")}
            icon={<Grid3x3 size={24} />}
            label="Grid"
            isActive={pathname === "/"}
            onClick={(e) => {
              if (!onFeed) {
                setNextViewVia("menu");
              } else if (!isModifiedClick(e)) {
                // As the feed's back arrow does.
                e.preventDefault();
                returnToGrid(router, "menu");
              }
            }}
          />
          <MenuButton
            href={
              position == null
                ? "/feed"
                : skinPath(position.skin.md5, position.skin.fileName)
            }
            icon={<Smartphone size={24} />}
            label="Feed"
            isActive={onFeed}
            onClick={() => {
              if (!onFeed) setNextViewVia("menu");
            }}
          />
          <MenuButton
            href="/upload"
            icon={<Upload size={24} />}
            label="Upload"
            isActive={pathname === "/upload"}
          />
          <MenuButton
            icon={<Menu size={24} />}
            label="Menu"
            onClick={toggleHamburger}
            isButton
            isActive={false}
            isExpanded={isHamburgerOpen}
          />
        </div>
      </div>
    </>
  );
}

type MenuButtonProps = {
  href?: string;
  icon: React.ReactNode;
  label: string;
  isButton?: boolean;
  isActive?: boolean;
  isExpanded?: boolean;
  onClick?: (e: React.MouseEvent) => void;
};

// A click meant for the browser, e.g. to open the link in a new tab.
export function isModifiedClick(e: React.MouseEvent): boolean {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}

function MenuButton({
  href,
  icon,
  label,
  isButton = false,
  isActive = false,
  isExpanded,
  onClick,
}: MenuButtonProps) {
  const touchTargetSize = "3.0rem";

  const containerStyle = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "0.25rem",
    color: "#ccc",
    textDecoration: "none",
    cursor: "pointer",
    transition: "color 0.2s ease",
    background: "none",
    border: "none",
    padding: 0,
    position: "relative" as const,
    width: touchTargetSize,
    minWidth: touchTargetSize,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = "#fff";
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = "#ccc";
  };

  const content = (
    <>
      {/* Active indicator line */}
      {isActive && (
        <ViewTransition name="footer-menu-active">
          <div
            style={{
              position: "absolute",
              top: "-0.75rem",
              left: 0,
              width: touchTargetSize,
              height: "1px",
              backgroundColor: "#fff",
            }}
          />
        </ViewTransition>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontSize: "0.65rem",
          fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
          fontWeight: 500,
        }}
      ></span>
    </>
  );

  if (isButton) {
    return (
      <button
        data-hamburger-toggle
        aria-label={label}
        aria-expanded={isExpanded}
        title={label}
        style={containerStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href!}
      title={label}
      style={containerStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {content}
    </Link>
  );
}

type HamburgerMenuItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  external?: boolean;
};

function HamburgerMenuItem({
  href,
  icon,
  label,
  onClick,
  external = false,
}: HamburgerMenuItemProps) {
  const content = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "1rem 1.5rem",
        color: "#ccc",
        textDecoration: "none",
        cursor: "pointer",
        transition: "background-color 0.2s ease, color 0.2s ease",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
        e.currentTarget.style.color = "#fff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.color = "#ccc";
      }}
    >
      {icon}
      <span
        style={{
          fontSize: "0.9rem",
          fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
  );

  if (external) {
    return (
      <a
        href={href}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} style={{ textDecoration: "none" }}>
      {content}
    </Link>
  );
}
