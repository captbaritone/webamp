import polygonClipping, {
  Polygon,
  MultiPolygon,
  Pair,
  Ring,
} from "polygon-clipping";
import regionParser from "./regionParser";

const HEIGHT = 116;
const SHADE_HEIGHT = 14;
const WIDTH = 275;
const largeWindowBounds = [[makeBox(WIDTH, HEIGHT)]] as MultiPolygon;
const shadeWindowBounds = [[makeBox(WIDTH, SHADE_HEIGHT)]] as MultiPolygon;

const maxBounds: { [name: string]: MultiPolygon } = {
  normal: largeWindowBounds,
  equalizer: largeWindowBounds,
  windowshade: shadeWindowBounds,
  equalizerws: shadeWindowBounds,
};

export function getTransparentAreaSize(regionTxt: string): number {
  const regions = regionParser(regionTxt);

  let totalTransparentArea = 0;
  for (const _name of Object.keys(regions)) {
    const name = _name.toLocaleLowerCase();
    const region = regions[name];
    if (region == null || region.length === 0) {
      continue;
    }
    const max = maxBounds[name];
    if (max == null) {
      // This is an invalid region.
      continue;
    }

    const opaque = regionStringsToPolygons(region);
    const transparent = polygonClipping.difference(max, opaque);
    const transparentArea = getMultipolygonArea(transparent);
    totalTransparentArea += transparentArea;
  }
  return totalTransparentArea;
}

// Compute the area of a multi-polygon.
// Note: If there are overlaps they might be computed multiple times.
function getMultipolygonArea(multipolygon: MultiPolygon) {
  let area = 0;
  for (const polygon of multipolygon) {
    for (const ring of polygon) {
      area += getArea(ring);
    }
  }
  return area;
}

// Make a box polygon with the given width and height.
function makeBox(width: number, height: number): Ring {
  return [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
    [0, 0],
  ];
}

// Given a parsed list of region.txt polygon strings, return a list of polygons
// which are closed (end where they begin).
function regionStringsToPolygons(region: string[]): Polygon[] {
  return region.map((p) => {
    const points: Ring = p.split(" ").map((p) => {
      return p.split(",").map((n) => parseInt(n, 10)) as Pair;
    });
    // Ensure these close properly.
    points.push(points[0]);
    return [points];
  });
}

// Get the area of a single Ring (simple polygon).
// Assumes the polygon is closed (ends where it begins).
function getArea(points: Ring) {
  let det = 0;

  const l = points.length;
  if (l < 3) {
    return 0;
  }

  for (let i = 1; i < l; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    det += p1[0] * p2[1] - p1[1] * p2[0];
  }
  return Math.abs(det) / 2;
}
