import { hexToRgb } from "../utils";

export class Edges {
  _data: ImageData;
  _width: number;
  // [x:refPoint, y:refPoint, ax: clip.x, ay:clip.y]
  _top: number[][] = [];
  _right: number[][] = [];
  _bottom: number[][] = [];
  _left: number[][] = [];

  /**
   * Replacable function
   */
  opaque: (x: number, y: number) => boolean;

  //? return true if not transparent
  opaqueByTransparent(x: number, y: number): boolean {
    return this._data.data[(x + y * this._width) * 4 + 3] != 0;
  }

  parseCanvasTransparency(
    canvas: HTMLCanvasElement,
    preferedWidth: number,
    preferedHeight: number
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
        this._data.data[(x + y * this._width) * 4 + 0] == rgb.r &&
        this._data.data[(x + y * this._width) * 4 + 1] == rgb.g &&
        this._data.data[(x + y * this._width) * 4 + 2] == rgb.b
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
      const start = (x + y * this._width) * 4;
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
    preferedWidth: number,
    preferedHeight: number
  ) {
    const w = preferedWidth || canvas.width;
    const h = preferedHeight || canvas.height;
    this._width = w;
    const ctx = canvas.getContext("2d");
    this._data = ctx.getImageData(0, 0, w, h);
    let points: number[][] = [];
    var x: number, y: number;

    function post(x: number, y: number, ax: number, ay: number) {
      points.push([x, y, ax, ay]);
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
    const lastTop: number =
      points.length == 0 ? 0 : points[points.length - 1][1]; // get y

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
    const lastRight: number =
      points.length == 0 ? w - 1 : points[points.length - 1][0]; // get x

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
    const lastBottom: number =
      points.length == 0 ? h - 1 : points[points.length - 1][1]; // get y

    //? Left -------------------------------------------------
    points = [];
    for (y = lastBottom; y >= 0; y--) {
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

  _buildPoint(points: number[][]):string {
    return points.map((point):string=>`${point[2]}px ${point[3]}px`).join(', ')
  }

  gettop(): string {
    return this._top.join(", ");
  }
  getright(): string {
    return this._right.join(", ");
  }

  getbottom(): string {
    return this._bottom.join(", ");
  }

  getleft(): string {
    return this._left.join(", ");
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
    const result: string[] = [];
    let lastPoint = [-1,-1,-1,-1];
    for (var point of points) {
      //skip same value as previous
      if (point[2] != lastPoint[2] || point[3] != lastPoint[3]) {
        const [x, y, ax, ay] = point;
        result.push(`${ax}px ${ay}px`);
      }
      lastPoint = point;
    }
    return `polygon(${result.join(", ")})`;
    // TODO: detect if first points in bottom has ben detected by right.
  }
}
