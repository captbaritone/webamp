/** Shamelessly copied from the Webamp package. We should probably pull this out into a separate package. */

interface IniData {
  [section: string]: {
    [key: string]: string;
  };
}

export function pointPairs(arr: string[]): string[] {
  const pairedValues = [];
  for (let i = 0; i < arr.length; i += 2) {
    // @ts-ignore
    pairedValues.push(`${arr[i]},${arr[i + 1]}`);
  }
  return pairedValues;
}

type RegionData = { [section: string]: string[] };

export default function regionParser(regionStr: string): RegionData {
  const iniData = parseIni(regionStr);
  const data: RegionData = {};
  Object.keys(iniData).forEach((section) => {
    const { numpoints, pointlist } = iniData[section];
    if (!numpoints || !pointlist) {
      return;
    }
    const pointCounts = numpoints.split(/\s*,\s*/).filter((val) => val !== "");
    const points = pointPairs(
      // points can be separated by spaces, or by commas
      pointlist.split(/\s*[, ]\s*/).filter((val) => val !== "")
    );
    let pointIndex = 0;
    const polygons = pointCounts.map((numStr) => {
      const num = Number(numStr);
      if (num < 3) {
        // What use is a polygon with less than three sides?
        pointIndex += num;
        return null;
      }
      const polygon = points.slice(pointIndex, pointIndex + num).join(" ");
      if (!polygon.length) {
        // It's possible that the skin author specified more polygons than provided points.
        return null;
      }
      pointIndex += num;
      return polygon;
    });
    const validPolygons = polygons.filter(
      (polygon) => polygon != null
    ) as string[];
    if (validPolygons.length) {
      data[section] = validPolygons;
    }
  });

  return data;
}

const SECTION_REGEX = /^\s*\[(.+?)\]\s*$/;
const PROPERTY_REGEX = /^\s*([^;][^=]*)\s*=\s*(.*)\s*$/;

const parseIni = (text: string): IniData => {
  let section: string, match;
  return text.split(/[\r\n]+/g).reduce((data: IniData, line) => {
    if ((match = line.match(PROPERTY_REGEX)) && section != null) {
      const key = match[1].trim().toLowerCase();
      const value = match[2]
        // Ignore anything after a second `=`
        // TODO: What if this is inside quotes or escaped?
        .replace(/=.*$/g, "")
        .trim()
        // Strip quotes
        // TODO: What about escaped quotes?
        // TODO: What about unbalanced quotes?
        .replace(/(^")|("$)|(^')|('$)/g, "");
      data[section][key] = value;
    } else if ((match = line.match(SECTION_REGEX))) {
      section = match[1].trim().toLowerCase();
      data[section] = {};
    }
    return data;
  }, {});
};
