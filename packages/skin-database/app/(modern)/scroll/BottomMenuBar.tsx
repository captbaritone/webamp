"use client";

import {
  Smartphone,
  Search,
  Info,
  Grid3x3,
  Menu,
  MessageSquare,
  Upload,
  Github,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { logUserEvent } from "./Events";

type Props = {
  sessionId?: string;
};

export default function BottomMenuBar({ sessionId }: Props) {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const handleMenuClick = (menuItem: string) => {
    if (sessionId) {
      logUserEvent(sessionId, {
        type: "menu_click",
        menuItem,
      });
    }
  };

  const toggleHamburger = () => {
    setIsHamburgerOpen(!isHamburgerOpen);
    handleMenuClick("hamburger");
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
          ref={menuRef}
          style={{
            position: "absolute",
            bottom: "4.5rem",
            left: 0,
            width: "100%",
            backgroundColor: "rgba(26, 26, 26, 0.98)",
            backdropFilter: "blur(10px)",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            zIndex: 999,
          }}
        >
          <HamburgerMenuItem
            href="/about"
            icon={<Info size={20} />}
            label="About"
            onClick={() => {
              handleMenuClick("about");
              setIsHamburgerOpen(false);
            }}
          />
          <HamburgerMenuItem
            href="/upload"
            icon={<Upload size={20} />}
            label="Upload"
            onClick={() => {
              handleMenuClick("upload");
              setIsHamburgerOpen(false);
            }}
          />{" "}
          <HamburgerMenuItem
            href="https://github.com/captbaritone/webamp/issues"
            icon={<MessageSquare size={20} />}
            label="Feedback"
            onClick={() => {
              handleMenuClick("feedback");
              setIsHamburgerOpen(false);
            }}
            external
          />
          <HamburgerMenuItem
            href="https://github.com/captbaritone/webamp/"
            icon={<Github size={20} />}
            label="GitHub"
            onClick={() => {
              handleMenuClick("feedback");
              setIsHamburgerOpen(false);
            }}
            external
          />
        </div>
      )}

      {/* Bottom Menu Bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          backgroundColor: "rgba(26, 26, 26, 0.95)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "0.75rem 0",
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <MenuButton
          href="/scroll"
          icon={<Smartphone size={24} />}
          label="Feed"
          onClick={() => handleMenuClick("feed")}
          isActive={pathname === "/scroll"}
        />
        <MenuButton
          href="/"
          icon={<Grid3x3 size={24} />}
          label="Grid"
          onClick={() => handleMenuClick("grid")}
          isActive={pathname === "/"}
        />
        <MenuButton
          href="/"
          icon={<Search size={24} />}
          label="Search"
          onClick={() => handleMenuClick("search")}
          isActive={false}
        />
        <MenuButton
          icon={<Menu size={24} />}
          label="Menu"
          onClick={toggleHamburger}
          isButton
          isActive={false}
        />
      </div>
    </>
  );
}

type MenuButtonProps = {
  href?: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isButton?: boolean;
  isActive?: boolean;
};

function MenuButton({
  href,
  icon,
  label,
  onClick,
  isButton = false,
  isActive = false,
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
      >
        {label}
      </span>
    </>
  );

  if (isButton) {
    return (
      <button
        onClick={onClick}
        style={containerStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href!}
      onClick={onClick}
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
