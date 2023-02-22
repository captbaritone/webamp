import { hexToRgb } from "../utils";

export class Edges {
  _data: ImageData;
  _w: number;
  // [x:refPoint, y:refPoint, ax: clip.x, ay:clip.y]
  _top: number[][] = [];
  _right: number[][] = [];
  _bottom: number[][] = [];
  _left: number[][] = [];
  simplify: boolean = true;

  /**
   * Replacable function
   */
  opaque: (x: number, y: number) => boolean;

  //? return true if not transparent
  opaqueByTransparent(x: number, y: number): boolean {
    return this._data.data[(x + y * this._w) * 4 + 3] != 0;
  }

  parseCanvasTransparency(
    canvas: HTMLCanvasElement,
    preferedWidth: number = null,
    preferedHeight: number = null
  ) {
    //set:
    this.opaque = this.opaqueByTransparent;
    this._parseCanvasTransparency(canvas, preferedWidth, preferedHeight);
  }

  parseCanvasTransparencyByNonColor(canvas: HTMLCanvasElement, color: string) {
    const rgb = hexToRgb(color);
    //set
    this.opaque = (x: number, y: number): boolean => {
      return (
        this._data.data[(x + y * this._w) * 4 + 0] == rgb.r &&
        this._data.data[(x + y * this._w) * 4 + 1] == rgb.g &&
        this._data.data[(x + y * this._w) * 4 + 2] == rgb.b
      );
    };
    this._parseCanvasTransparency(canvas, null, null);
  }

  parseCanvasTransparencyByColor(canvas: HTMLCanvasElement, color: string) {
    const sum = (r: number, g: number, b: number) => r | (g << 8) | (b << 16);
    const rgb = hexToRgb(color);
    const transparent = sum(rgb.r, rgb.g, rgb.b);
    //set:
    this.opaque = (x: number, y: number): boolean => {
      const start = (x + y * this._w) * 4;
      const data = this._data.data.slice(start, start + 4);
      const result =
        //? opaque = pixel != color
        sum(data[0], data[1], data[2]) != transparent;
      return result;
    };
    this._parseCanvasTransparency(canvas, null, null);
  }

  _parseCanvasTransparency(
    canvas: HTMLCanvasElement,
    preferedWidth: number = null,
    preferedHeight: number = null
  ) {
    const w = preferedWidth || canvas.width;
    const h = preferedHeight || canvas.height;
    this._w = w;
    const ctx = canvas.getContext("2d");
    this._data = ctx.getImageData(0, 0, w, h);
    let points: number[][] = [];
    var x: number, y: number, lastX: number, lastY: number;

    function post(x: number, y: number, ax: number, ay: number) {
      points.push([ax, ay]);
      lastX = x;
      lastY = y;
    }

    //? top -------------------------------------------------
    points = [];
    for (x = 0; x < w; x++) {
      //? scan top, left->right
      for (y = 0; y < h; y++) {
        //? find most top of non-transparent
        if (this.opaque(x, y)) {
          post(x, y, x, y);
          post(x, y, x + 1, y);
          break;
        }
      }
    }
    this._top = points;
    const lastTop: number = lastY;
    const firstTop: number = points.length > 0 ? points[0][1] : 0;

    //? Right -------------------------------------------------
    points = [];
    for (y = lastTop; y < h; y++) {
      //? scan right, top->bottom
      for (x = w - 1; x >= 0; x--) {
        //? find most right of non-transparent
        if (this.opaque(x, y)) {
          post(x, y, x + 1, y);
          post(x, y, x + 1, y + 1);
          break;
        }
      }
    }
    this._right = points;
    const lastRight: number = lastX;

    //? bottom -------------------------------------------------
    points = [];
    for (x = lastRight; x >= 0; x--) {
      //? scan bottom, right->left
      for (y = h - 1; y >= 0; y--) {
        //? find most top of non-transparent
        if (this.opaque(x, y)) {
          post(x, y, x + 1, y + 1);
          post(x, y, x, y + 1);

          break;
        }
      }
    }
    this._bottom = points;
    const lastBottom: number = lastY;

    //? Left -------------------------------------------------
    points = [];
    for (y = lastBottom; y >= firstTop; y--) {
      //? scan left, bottom->top
      for (x = 0; x < w; x++) {
        //? find most right of non-transparent
        if (this.opaque(x, y)) {
          post(x, y, x, y + 1);
          post(x, y, x, y);
          break;
        }
      }
    }
    this._left = points;
  }

  _buildPoint(points: number[][]): string {
    const result = this.simplify ? simplifyPoints(points) : points;
    return result
      .map((point): string => `${point[0]}px ${point[1]}px`)
      .join(", ");
  }

  gettop(): string {
    return this._buildPoint(this._top);
  }
  getright(): string {
    return this._buildPoint(this._right);
  }
  getbottom(): string {
    return this._buildPoint(this._bottom);
  }
  getleft(): string {
    return this._buildPoint(this._left);
  }

  isSimpleRect(): boolean {
    return this._top.length == 2 && this._bottom.length == 2;
  }

  getPolygon(): string {
    // to avoid empty between two comma separator, we explode values befor join().
    const points = [
      ...this._top,
      ...this._right,
      ...this._bottom,
      ...this._left,
    ];

    // const result: string[] = [];
    // let lastPoint = [-1, -1];
    // for (var point of points) {
    //   //skip same value as previous
    //   if (point[0] != lastPoint[0] || point[1] != lastPoint[1]) {
    //     const [ax, ay] = point;
    //     result.push(`${ax}px ${ay}px`);
    //   }
    //   lastPoint = point;
    // }

    return `polygon(${this._buildPoint(points)})`;
    // TODO: detect if first points in bottom has ben detected by right.
  }
}

function simplifyPoints(points: number[][]) {
  const result: number[][] = [];
  let i = 0;
  let [lx, ly] = [-1, -1];
  let [llx, lly] = [-2, -2];
  while (i < points.length) {
    const next = () => {
      llx = lx;
      lly = ly;
      lx = x;
      ly = y;
      i++;
    };
    const [x, y] = points[i];

    //? duplicate
    if (x == lx && y == ly) {
      next();
      continue;
    }

    if (result.length >= 2) {
      const [px, py] = result[result.length - 1];
      const [ppx, ppy] = result[result.length - 2];
      //? vertically, same direction
      if (x == px && (py != ppy || px == ppx)) {
        const [xx, yy] = result.pop();
        result.push([xx, y]); //? set new Y
        next();
        continue;
      }
      //? horizontally, same direction
      if (y == py && (px != ppx || py == ppy)) {
        const [xx, xy] = result.pop();
        result.push([x, xy]); //? set new X
        next();
        continue;
      }
    }

    result.push([x, y]);
    next();
  }
  return result;
}
