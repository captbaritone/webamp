export class Edges {
  _top: string[] = [];
  _right: string[] = [];
  _bottom: string[] = [];
  _left: string[] = [];

  parseCanvasTransparency(canvas: HTMLCanvasElement, preferedWidth:number, preferedHeight:number) {
    const w = preferedWidth || canvas.width;
    const h = preferedHeight || canvas.height;
    const ctx = canvas.getContext("2d");
    const data = ctx.getImageData(0, 0, w, h).data;
    let points: string[] = [];
    var x, y, lastX, lastY;
    var lastfoundx: number, lastfoundy: number, pending: boolean;
    var first: boolean;

    //? return true if not transparent
    function opaque(ax: number, ay: number): boolean {
      return data[(ax + ay * w) * 4 + 3] != 0;
    }

    function post(ax: number, ay: number) {
      points.push(`${ax}px ${ay}px`);
    }

    //? top -------------------------------------------------
    points = [];
    lastY = 0;
    first = true;
    pending = false;
    for (x = 0; x < w; x++) {
      //? scan top, left->right
      for (y = 0; y < h; y++) {
        //? find most top of non-transparent
        if (opaque(x, y)) {
          if (!first && y != lastY && pending) {
            post(lastfoundx + 1, lastfoundy);
          }
          if (first || y != lastY || x == w) {
            first = false;
            post(x, y);
            lastY = y;
            pending = false;
          } else if (x == w && pending) {
            post(lastfoundx, lastfoundy);
          } else {
            pending = true;
          }
          lastfoundx = x;
          lastfoundy = y;
          break;
        }
      }
      if (x == w - 1 && pending) {
        post(lastfoundx + 1, lastfoundy);
      }
    }
    this._top = points; // points.join(', \n')

    //? Right -------------------------------------------------
    points = [];
    lastX = 0;
    first = true;
    pending = false;
    for (y = 0; y <= h; y++) {
      //? scan right, top->bottom
      for (x = w - 1; x >= 0; x--) {
        //? find most right of non-transparent
        if (opaque(x, y)) {
          if (!first && x != lastX && pending) {
            post(lastfoundx + 1, lastfoundy);
          }
          if (first || x != lastX || y == h - 1) {
            first = false;
            post(x + 1, y);
            lastX = x;
            pending = false;
          } else if (y == h && pending) {
            post(lastfoundx + 1, lastfoundy);
            pending = false;
          } else {
            pending = true;
          }
          lastfoundx = x;
          lastfoundy = y;
          break;
        }
      }
      if (y == h - 1 && pending) {
        // last
        post(lastfoundx + 1, lastfoundy);
      }
    }
    this._right = points; // points.join(', \n')

    //? bottom -------------------------------------------------
    points = [];
    lastY = h - 1;
    first = true;
    pending = false;
    for (x = w; x >= 0; x--) {
      //? scan bottom, right->left
      for (y = h - 1; y >= 0; y--) {
        //? find most top of non-transparent
        if (opaque(x, y)) {
          if (!first && y != lastY && pending) {
            post(lastfoundx, lastfoundy + 1);
          }
          if (first || y != lastY || x == 0) {
            first = false;
            post(x, y + 1);
            lastY = y;
            pending = false;
          } else if (x == 0 && pending) {
            post(lastfoundx, lastfoundy + 1);
            pending = false;
          } else {
            pending = true;
          }
          lastfoundx = x;
          lastfoundy = y;
          break;
        }
      }
      if (x == 0 && pending) {
        // last
        post(lastfoundx, lastfoundy + 1);
      }
    }
    this._bottom = points; // points.join(', \n')
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
    return `polygon(${[
      ...this._top,
      ...this._right,
      ...this._bottom,
      ...this._left,
    ].join(", ")})`;
    // TODO: detect if first points in bottom has ben detected by right.
  }
}
