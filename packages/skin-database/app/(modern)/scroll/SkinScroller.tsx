"use client";

import { useState, useLayoutEffect, useEffect } from "react";
import SkinPage from "./SkinPage";
import { logUserEvent } from "./Events";

export type ClientSkin = {
  screenshotUrl: string;
  fileName: string;
  md5: string;
  readmeStart: string;
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

  useLayoutEffect(() => {
    if (containerRef == null) {
      return;
    }

    function onSnap(e) {
      const md5 = e.snapTargetBlock.getAttribute("skin-md5");
      const index = parseInt(e.snapTargetBlock.getAttribute("skin-index"));
      setVisibleSkinIndex(index);
    }

    containerRef.addEventListener("scrollsnapchange", onSnap);

    return () => {
      containerRef.removeEventListener("scrollsnapchange", onSnap);
    };
  }, [containerRef]);

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
    <div
      ref={setContainerRef}
      style={{
        height: "100vh",
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
      }}
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
  );
}
