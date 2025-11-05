"use client";

import { useState, useLayoutEffect } from "react";

export type ClientSkin = {
  screenshotUrl: string;
  fileName: string;
  md5: string;
  readmeStart: string;
};

type Props = {
  initialSkins: ClientSkin[];
  getSkins: (offset: number) => Promise<ClientSkin[]>;
};

export default function SkinScroller({ initialSkins, getSkins }: Props) {
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

  useLayoutEffect(() => {
    if (fetching) {
      return;
    }
    if (visibleSkinIndex + 5 >= skins.length) {
      setFetching(true);
      getSkins(skins.length).then((newSkins) => {
        setSkins([...skins, ...newSkins]);
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
          <div
            key={skin.md5}
            skin-md5={skin.md5}
            skin-index={i}
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100vh",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
            }}
          >
            <img
              src={skin.screenshotUrl}
              alt={skin.fileName}
              style={{
                paddingTop: "4rem",
                boxSizing: "border-box",
                width: "100%",
                imageRendering: "pixelated",
              }}
            />
            <div
              style={{
                color: "white",
                flexGrow: 1,
                paddingLeft: "0.5rem",
                paddingTop: "0.5rem",
              }}
            >
              <h2
                style={{
                  marginBottom: 0,
                  fontSize: "0.9rem",
                  paddingBottom: "0",
                  fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                  color: "#ccc",
                }}
              >
                {skin.fileName}
              </h2>
              <p
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.75rem",
                  paddingTop: "0",
                  color: "#999",
                  fontFamily: 'monospace, "Courier New", Courier, monospace',
                }}
              >
                {skin.readmeStart}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
