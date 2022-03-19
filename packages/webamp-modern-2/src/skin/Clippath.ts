export class Edges {
  _top: string[];
  _right: string[];
  _bottom: string[] = [];
  _left: string[] = [];

  parseCanvasTransparency(canvas: HTMLCanvasElement) {
    const w = canvas.width;
    const h = canvas.height;
    console.log(w, h);
    const ctx = canvas.getContext("2d");
    const data = ctx.getImageData(0, 0, w, h).data;
    let points: string[] = [];
    var x, y, lastX, lastY;
    var alpha: number;
    var lastfoundx: number, lastfoundy: number, pending: boolean;
    var first: boolean, found: boolean;

    //? return true if not transparent
    function fine(ax: number, ay: number): number {
      return data[(ax + ay * w) * 4 + 3];
    }

    function post(ax: number, ay: number) {
      points.push(`${ax}px ${ay}px`);
      // points.push(`x:${ax} y:${ay}`)
    }

    //? top -------------------------------------------------
    points = [];
    lastY = 0;
    first = true;
    pending = false;
    for (x = 0; x <= w; x++) {
      //? scan top, left->right
      found = false;
      for (y = 0; y <= h; y++) {
        //? find most top of non-transparent
        if ((alpha = fine(x, y))) {
          found = true;
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
        post(lastfoundx+1, lastfoundy);
      }

      lastX = x;
    }
    this._top = points; // points.join(', \n')

    //? Right -------------------------------------------------
    points = [];
    lastX = 0;
    first = true;
    pending = false;
    for (y = 0; y <= h; y++) {
      //? scan right, top->bottom
      found = false;
      for (x = w - 1; x >= 0; x--) {
        //? find most right of non-transparent
        if (fine(x, y)) {
          found = true;
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
      lastY = y;
    }
    this._right = points; // points.join(', \n')

    //? bottom -------------------------------------------------
    points = [];
    lastY = h - 1;
    first = true;
    pending = false;
    for (x = w; x >= 0; x--) {
      //? scan bottom, right->left
      found = false;
      for (y = h - 1; y >= 0; y--) {
        //? find most top of non-transparent
        if (fine(x, y)) {
          found = true;
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
      lastX = x;
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
    return `polygon(${this.gettop()}, ${this.getright()}, ${this.getbottom()})`;
  }
}
