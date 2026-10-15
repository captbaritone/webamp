import { useMemo, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

export type ClipPath = {
  // Polygon point strings, in pixels of the window they clip.
  polygons: string[];
  // The size of that window.
  width: number;
  height: number;
};

type Props = {
  children: { [id: string]: ClipPath };
};

// Clip paths keyed by id. Each is defined relative to the box of the element
// it clips (objectBoundingBox), with its pixel coordinates scaled down by the
// window's size, so it scales with the window however the page scales it.
// Browsers disagree on whether CSS zoom scales a clip path given in pixels
// (Firefox doesn't).
export default function ClipPaths({ children }: Props) {
  const paths = useMemo(() => {
    return document.createElement("div");
  }, []);

  useLayoutEffect(() => {
    document.body.appendChild(paths);
    return () => paths.remove();
  }, [paths]);

  return createPortal(
    <svg height={0} width={0}>
      <defs>
        {Object.entries(children).map(([id, { polygons, width, height }]) => (
          <clipPath
            id={id}
            key={id}
            clipPathUnits="objectBoundingBox"
            transform={`scale(${1 / width} ${1 / height})`}
          >
            {polygons.map((points, i) => (
              <polygon points={points} key={i} />
            ))}
          </clipPath>
        ))}
      </defs>
    </svg>,
    paths
  );
}
