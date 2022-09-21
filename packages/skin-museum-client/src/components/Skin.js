import React, { useState, useCallback } from "react";
import * as Utils from "../utils";
import { SCREENSHOT_HEIGHT } from "../constants";
import CancelableImg from "./CancelableImg";

function Skin({
  style,
  height,
  width,
  color,
  selectSkin,
  hash,
  permalink,
  src,
  fileName,
  nsfw,
  consentsToNsfw,
  doesNotConcentToNsfw,
  showNsfw,
}) {
  const [loaded, setLoaded] = useState(false);
  const [ref, setRef] = useState(null);

  const clickHandler = useCallback(
    (e) => {
      if (nsfw && !showNsfw) {
        if (
          !window.confirm(
            'This skin has been flagged as "not safe for work". Reveal all NSFW content?'
          )
        ) {
          e.preventDefault();
          doesNotConcentToNsfw();
          return;
        } else {
          consentsToNsfw();
        }
      }
      if (Utils.eventIsLinkClick(e)) {
        e.preventDefault();
        if (ref == null) {
          // This probably never happens
          selectSkin(hash, { top: 0, left: 0 });
          return;
        }
        const { top, left } = ref.getBoundingClientRect();
        selectSkin(hash, { top, left });
      }
    },
    [
      consentsToNsfw,
      doesNotConcentToNsfw,
      hash,
      nsfw,
      ref,
      selectSkin,
      showNsfw,
    ]
  );

  const imgStyle = {
    imageRendering: height >= SCREENSHOT_HEIGHT ? "pixelated" : null,
    boxShadow: "inset 0px 0px 10px rgba(0, 0, 0, 0.5)",
    height: "100%",
    opacity: loaded ? 1 : 0,
    transition: "opacity 0.2s",
    backfaceVisibility: loaded ? "hidden" : null,
    filter: nsfw && !showNsfw ? "blur(10px)" : null,
    outline: "none",
  };

  return (
    <a
      ref={setRef}
      style={{
        ...style,
        display: "block",
        height,
        width,
        // Ideally the final backgroundColor would be black
        // But that makes our opacitly transition kinda funky
        // This was causing perf issues
        // backgroundColor: color,
        cursor: "pointer",
      }}
      onClick={clickHandler}
      href={permalink}
    >
      <CancelableImg
        tabIndex={1}
        src={src}
        style={imgStyle}
        onLoad={() => setLoaded(true)}
        alt={fileName}
      />
    </a>
  );
}
export default Skin;
