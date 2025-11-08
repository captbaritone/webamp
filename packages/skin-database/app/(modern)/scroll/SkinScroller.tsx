"use client";

import { useState, useLayoutEffect, useEffect } from "react";
import SkinPage from "./SkinPage";
import { logUserEvent } from "./Events";
import { useScrollHint } from "./useScrollHint";

export type ClientSkin = {
  screenshotUrl: string;
  fileName: string;
  md5: string;
  readmeStart: string;
  downloadUrl: string;
  shareUrl: string;
  nsfw: boolean;
  likeCount: number;
};

type Props = {
  initialSkins: ClientSkin[];
  getSkins: (sessionId: string, offset: number) => Promise<ClientSkin[]>;
  sessionId: string;
};

export default function SkinScroller({
  initialSkins,
  getSkins,
  sessionId,
}: Props) {
  const [skins, setSkins] = useState<ClientSkin[]>(initialSkins);
  const [visibleSkinIndex, setVisibleSkinIndex] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [hasEverScrolled, setHasEverScrolled] = useState(false);

  // Track if user has ever scrolled to another skin
  useEffect(() => {
    if (visibleSkinIndex > 0) {
      setHasEverScrolled(true);
    }
  }, [visibleSkinIndex]);

  // Show scroll hint only if user has never scrolled to another skin
  useScrollHint({
    containerRef,
    enabled: visibleSkinIndex === 0 && !hasEverScrolled,
    onHintShown: () => {
      logUserEvent(sessionId, {
        type: "scroll_hint_shown",
      });
    },
  });

  useLayoutEffect(() => {
    if (containerRef == null) {
      return;
    }

    // Use IntersectionObserver for cross-browser compatibility (iOS doesn't support scrollsnapchange)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When an element becomes mostly visible (> 50% intersecting)
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = parseInt(
              entry.target.getAttribute("skin-index") || "0"
            );
            setVisibleSkinIndex(index);
          }
        });
      },
      {
        root: containerRef,
        threshold: 0.5, // Trigger when 50% of the element is visible
      }
    );

    // Observe all skin page elements
    const skinElements = containerRef.querySelectorAll("[skin-index]");
    skinElements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [containerRef, skins.length]);

  useEffect(() => {
    logUserEvent(sessionId, {
      type: "session_start",
    });

    function beforeUnload() {
      logUserEvent(sessionId, {
        type: "session_end",
        reason: "before_unload",
      });
    }

    addEventListener("beforeunload", beforeUnload);
    return () => {
      removeEventListener("beforeunload", beforeUnload);
      logUserEvent(sessionId, {
        type: "session_end",
        reason: "unmount",
      });
    };
  }, []);

  useEffect(() => {
    logUserEvent(sessionId, {
      type: "skin_view_start",
      skinMd5: skins[visibleSkinIndex].md5,
    });
    const startTime = Date.now();
    return () => {
      const durationMs = Date.now() - startTime;
      logUserEvent(sessionId, {
        type: "skin_view_end",
        skinMd5: skins[visibleSkinIndex].md5,
        durationMs,
      });
    };
  }, [visibleSkinIndex, skins, fetching]);

  useLayoutEffect(() => {
    if (fetching) {
      return;
    }
    if (visibleSkinIndex + 5 >= skins.length) {
      setFetching(true);
      console.log("Fetching more skins...");
      logUserEvent(sessionId, {
        type: "skins_fetch_start",
        offset: skins.length,
      });
      getSkins(sessionId, skins.length)
        .then((newSkins) => {
          logUserEvent(sessionId, {
            type: "skins_fetch_success",
            offset: skins.length,
          });
          setSkins([...skins, ...newSkins]);
          setFetching(false);
        })
        .catch((error) => {
          logUserEvent(sessionId, {
            type: "skins_fetch_failure",
            offset: skins.length,
            errorMessage: error.message,
          });
          setFetching(false);
        });
    }
  }, [visibleSkinIndex, skins, fetching]);

  return (
    <>
      <div
        ref={setContainerRef}
        style={{
          height: "100vh",
          width: "100%",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE and Edge
          WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
        }}
        className="hide-scrollbar"
      >
        {skins.map((skin, i) => {
          return (
            <SkinPage
              key={skin.md5}
              skin={skin}
              index={i}
              sessionId={sessionId}
            />
          );
        })}
      </div>
      {/* Top shadow overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "4rem",
          background:
            "linear-gradient(180deg, rgba(26, 26, 26, 0.8) 0%, rgba(26, 26, 26, 0.4) 50%, rgba(26, 26, 26, 0) 100%)",
          pointerEvents: "none",
          zIndex: 500,
        }}
      />
    </>
  );
}
