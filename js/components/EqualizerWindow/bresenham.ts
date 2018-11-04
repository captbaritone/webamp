// Adapted from https://github.com/nquicenob/bresenham-line by Nicolas Quiceno
interface Point {
  x: number;
  y: number;
}

type Sign = 1 | -1;
function getSing(num: number): Sign {
  return num > 0 ? 1 : -1;
}

function getInitValues(startPoint: Point, finalPoint: Point) {
  const abs = Math.abs;
  const diffx = finalPoint.x - startPoint.x;
  const diffy = finalPoint.y - startPoint.y;

  return {
    absDiff: {
      x: abs(diffx),
      y: abs(diffy)
    },
    sign: {
      x: getSing(diffx),
      y: getSing(diffy)
    }
  };
}

function getBreakFn(sign: Sign): (current: number, final: number) => boolean {
  return sign < 0
    ? (current, final) => current >= final
    : (current, final) => current <= final;
}

function calcMainCoordinates(absDiff: Point): ["x", "y"] | ["y", "x"] {
  return absDiff.x > absDiff.y ? ["x", "y"] : ["y", "x"];
}

export default function line(point: Point, finalPoint: Point) {
  const { absDiff, sign } = getInitValues(point, finalPoint);
  const [mainCoordinate, coordinate] = calcMainCoordinates(absDiff);

  const final = finalPoint[mainCoordinate];

  const mainSign = sign[mainCoordinate];
  const secondSign = sign[coordinate];

  const mainDiff = absDiff[mainCoordinate];
  const secondDiff = absDiff[coordinate];

  const breakFn = getBreakFn(mainSign);

  let mainValue = point[mainCoordinate];
  let secondValue = point[coordinate];

  let eps = 0;

  const points = [];
  for (; breakFn(mainValue, final); mainValue += mainSign) {
    points.push({
      [mainCoordinate]: mainValue,
      [coordinate]: secondValue
    });
    eps += secondDiff;
    if (eps << 1 >= mainDiff) {
      secondValue += secondSign;
      eps -= mainDiff;
    }
  }
  return points;
}
