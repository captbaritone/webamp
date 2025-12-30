"use client";

import {
  Smartphone,
  Info,
  Grid3x3,
  Menu,
  MessageSquare,
  Upload,
  Github,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_MAX_WIDTH } from "../../../legacy-client/src/constants";
import {
  // @ts-expect-error - unstable_ViewTransition is not yet in @types/react
  unstable_ViewTransition as ViewTransition,
  useState,
  useEffect,
  useRef,
} from "react";

export default function BottomMenuBar() {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const toggleHamburger = () => {
    setIsHamburgerOpen(!isHamburgerOpen);
  };

  // Close hamburger menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        isHamburgerOpen
      ) {
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
              href="/scroll/about"
              icon={<Info size={20} />}
              label="About"
              onClick={() => {
                setIsHamburgerOpen(false);
              }}
            />
            <HamburgerMenuItem
              href="/scroll/feedback"
              icon={<MessageSquare size={20} />}
              label="Feedback"
              onClick={() => {
                setIsHamburgerOpen(false);
              }}
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
        style={{
          position: "sticky",
          bottom: 0,
          left: 0,
          width: "100%",
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
            href="/scroll"
            icon={<Grid3x3 size={24} />}
            label="Grid"
            isActive={pathname === "/scroll"}
          />
          <MenuButton
            href="/scroll/skin"
            icon={<Smartphone size={24} />}
            label="Feed"
            isActive={pathname.startsWith("/scroll/skin")}
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
  onClick?: () => void;
};

function MenuButton({
  href,
  icon,
  label,
  isButton = false,
  isActive = false,
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
      <a href={href} onClick={onClick} style={{ textDecoration: "none" }}>
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
