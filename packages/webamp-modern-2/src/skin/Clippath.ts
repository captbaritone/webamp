export class Edges {
  _top: string[];
  _right: string[];
  _bottom: string[];
  _left: string[];

  parseCanvasTransparency(canvas: HTMLCanvasElement) {
    const w = canvas.width;
    const h = canvas.height;
    console.log(w, h);
    const ctx = canvas.getContext("2d");
    const data = ctx.getImageData(0, 0, w, h).data;
    let points: string[] = [];
    var x, y, lastX, lastY;
    var lastfoundx: number, lastfoundy: number, pending: boolean;
    var first: boolean, found: boolean, lastfounded: boolean;

    //? return true if not transparent
    function fine(ax, ay): boolean {
      return data[(ax + ay * w) * 4 + 3] != 0;
      // return data[(ax + (ay * w))*4+3] == 255;
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
        if (fine(x, y)) {
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
      if (!found && lastfounded) {
        post(lastX, lastY);
      }
      lastX = x;
      lastfounded = found;
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
          } else {
            pending = true;
          }
          lastfoundx = x;
          lastfoundy = y;
          break;
        }
      }
      if (!found && lastfounded) {
        post(lastX, lastY);
      }
      lastY = y;
      lastfounded = found;
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
          } else {
            pending = true;
          }
          lastfoundx = x;
          lastfoundy = y;
          break;
        }
      }
      if (!found && lastfounded) {
        post(lastX, lastY);
      }
      lastX = x;
      lastfounded = found;
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

  isSimpleRect(): boolean {
    return this._top.length == 2 && this._bottom.length == 2;
  }

  getPolygon(): string {
    return `polygon(${this.gettop()}, ${this.getright()}, ${this.getbottom()})`;
  }
}
