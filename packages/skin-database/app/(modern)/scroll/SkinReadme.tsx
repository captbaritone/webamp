"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { ClientSkin } from "./SkinScroller";
import { logUserEvent } from "./Events";

type Props = {
  skin: ClientSkin;
  sessionId: string;
  // Whether this skin is the one currently scrolled into view.
  focused: boolean;
};

const SLIDE_MS = 250;

// Where the expanded readme sits horizontally, relative to its feed page.
type ExpandedBox = { left: number; width: number };

/**
 * The filename and full readme, clipped to the space under the skin. If it
 * doesn't all fit it fades out, and tapping it slides it up over the skin
 * (its bottom resting on the bottom menu bar) to reveal the rest, scrolling if
 * there's still more.
 */
export default function SkinReadme({ skin, sessionId, focused }: Props) {
  // Holds the readme's place in the layout while it's expanded.
  const slotRef = useRef<HTMLDivElement>(null);
  const readmeRef = useRef<HTMLDivElement>(null);
  // The header and text, which slide; the fade at the bottom stays put.
  const contentRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedBox | null>(null);
  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;
  const collapsingRef = useRef(false);
  // Set when focus was inside the readme as it collapsed, so we can put it
  // back on the (collapsed) readme rather than lose it.
  const restoreFocusRef = useRef(false);

  useLayoutEffect(() => {
    const node = textRef.current;
    if (node == null || expanded != null) {
      return;
    }
    const measure = () =>
      setOverflowing(node.scrollHeight > node.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [skin.readme, expanded]);

  // The collapsed and expanded readme share a bottom edge (the top of the menu
  // bar), so the expanded one looks collapsed when its top is clipped down to
  // the slot's top and its content is shifted down by the same amount.
  function collapsedOffset(): number {
    const slot = slotRef.current!.getBoundingClientRect();
    const readme = readmeRef.current!.getBoundingClientRect();
    return Math.max(0, slot.top - readme.top);
  }

  function applyOffset(dy: number, easing: string | null) {
    const readme = readmeRef.current!;
    const content = contentRef.current!;
    const transition =
      easing == null
        ? "none"
        : `clip-path ${SLIDE_MS}ms ${easing}, transform ${SLIDE_MS}ms ${easing}`;
    readme.style.transition = transition;
    content.style.transition = transition;
    readme.style.clipPath = `inset(${dy}px 0 0 0)`;
    content.style.transform = `translateY(${dy}px)`;
  }

  function clearOffset() {
    for (const node of [readmeRef.current, contentRef.current]) {
      if (node == null) continue;
      node.style.transition = "";
      node.style.clipPath = "";
      node.style.transform = "";
    }
  }

  function expand() {
    const slot = slotRef.current;
    const page = slot?.closest("[data-skin-index]");
    if (slot == null || page == null || expandedRef.current != null) return;
    const slotRect = slot.getBoundingClientRect();
    const pageRect = page.getBoundingClientRect();
    // Keep the collapsed readme's space so nothing else moves.
    slot.style.height = `${slotRect.height}px`;
    setExpanded({ left: slotRect.left - pageRect.left, width: slotRect.width });
    logUserEvent(sessionId, { type: "readme_expand", skinMd5: skin.md5 });
  }

  // Slide up: start looking exactly like the collapsed readme, then animate to
  // the full box.
  useLayoutEffect(() => {
    const readme = readmeRef.current;
    if (expanded == null || readme == null) return;
    applyOffset(collapsedOffset(), null);
    // Force a reflow so the starting state takes effect before we animate.
    void readme.offsetHeight;
    applyOffset(0, "ease-out");
    // Once open, drop the clip, which would also clip the box shadow.
    const timer = setTimeout(() => {
      if (!collapsingRef.current) clearOffset();
    }, SLIDE_MS);
    return () => clearTimeout(timer);
  }, [expanded]);

  function collapse() {
    const readme = readmeRef.current;
    if (
      readme == null ||
      expandedRef.current == null ||
      collapsingRef.current
    ) {
      return;
    }
    collapsingRef.current = true;
    restoreFocusRef.current = readme.contains(document.activeElement);
    if (textRef.current) textRef.current.scrollTop = 0;
    applyOffset(0, null);
    void readme.offsetHeight;
    applyOffset(collapsedOffset(), "ease-in");
    // Don't wait on transitionend: it never fires under reduced motion.
    setTimeout(() => {
      clearOffset();
      if (slotRef.current) slotRef.current.style.height = "";
      collapsingRef.current = false;
      setExpanded(null);
    }, SLIDE_MS);
  }

  useEffect(() => {
    if (expanded == null && restoreFocusRef.current) {
      restoreFocusRef.current = false;
      readmeRef.current?.focus({ preventScroll: true });
    }
  }, [expanded]);

  // Collapse when the user scrolls on to another skin.
  useEffect(() => {
    if (!focused) collapse();
  }, [focused]);

  useEffect(() => {
    if (expanded == null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") collapse();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  const expandable = overflowing && expanded == null;

  return (
    <div ref={slotRef} className="skin-readme-slot">
      {/* Tapping anywhere outside the expanded readme collapses it. */}
      {expanded != null && (
        <div className="readme-expanded-dismiss" onClick={collapse} />
      )}
      <div
        ref={readmeRef}
        className={`skin-readme${expanded != null ? " expanded" : ""}`}
        style={
          expanded != null
            ? { left: expanded.left, width: expanded.width }
            : undefined
        }
        role={expandable ? "button" : undefined}
        tabIndex={expandable ? 0 : undefined}
        aria-expanded={overflowing ? expanded != null : undefined}
        aria-label={expandable ? `Read more about ${skin.fileName}` : undefined}
        onClick={expandable ? expand : undefined}
        onKeyDown={
          expandable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  expand();
                }
              }
            : undefined
        }
      >
        <div ref={contentRef} className="skin-readme-content">
          {skin.readme !== "" && (
            <div ref={textRef} className="skin-readme-text">
              {/*
                Floated into the text's top-right corner (and stuck there while
                it scrolls). Always rendered, so the text wraps the same way
                collapsed and expanded and nothing shifts as it opens.
              */}
              <button
                className="skin-readme-collapse"
                onClick={collapse}
                aria-label="Collapse readme"
                title="Collapse readme"
                // Hidden, unfocusable and ignored by assistive tech while
                // collapsed. Unlike aria-hidden, inert is safe to apply while
                // the button has focus (as it does when it's just been clicked).
                inert={expanded == null}
              >
                <ChevronDown size={22} />
              </button>
              {skin.readme}
            </div>
          )}
        </div>
        {/*
          Fades the bottom of the text to show there's more. It stays put while
          the readme expands, so the text slides up from under it.
        */}
        {(overflowing || expanded != null) && (
          <div className="skin-readme-fade" />
        )}
      </div>
    </div>
  );
}
