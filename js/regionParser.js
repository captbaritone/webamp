import { parseIni } from "./utils";

function pointPairs(arr) {
  const pairedValues = [];
  for (let i = 0; i <= arr.length; i += 2) {
    pairedValues.push(`${arr[i]},${arr[i + 1]}`);
  }
  return pairedValues;
}

export default function regionParser(regionStr) {
  const iniData = parseIni(regionStr);
  const data = {};
  Object.keys(iniData).forEach(key => {
    const numPoints = iniData[key].numpoints.split(/\s*,\s*/);
    // coords can be separated by spaces, or by commas
    const coords = iniData[key].pointlist.split(/\s*[, ]\s*/);
    const pointList = pointPairs(coords);
    let pointIndex = 0;
    data[key] = numPoints.map(numStr => {
      const num = Number(numStr);
      const polygon = pointList.slice(pointIndex, pointIndex + num).join(" ");
      pointIndex += num;
      return polygon;
    });
  });

  return data;
}
