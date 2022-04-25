import GuiObj from "./GuiObj";
import UI_ROOT from "../../UIRoot";
import { clamp, px } from "../../utils";

type ColorTriplet = string;

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Ceqvis.2F.3E
export default class EqVis extends GuiObj {
  static GUID = "8d1eba38489e483eb9608d1f43c5c405";
  _canvas: HTMLCanvasElement = document.createElement("canvas");
  _colorTop: ColorTriplet = "255,255,255";
  _colorMiddle: ColorTriplet = "255,255,255";
  _colorBotttom: ColorTriplet = "255,255,255";
  _colorPreamp: ColorTriplet = "0,0,0";

  constructor() {
    super();
    this.registerEqChanges();
  }

  registerEqChanges() {
    for (let i = 1; i <= 10; i++) {
      UI_ROOT.audio.onEqChange(String(i), this.update);
    }
  }

  update = () => {
    const ctx = this._canvas.getContext("2d");
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);
    const amplitudes = [];
    for (let i = 1; i <= 10; i++) {
      amplitudes.push(UI_ROOT.audio.getEq(String(i)));
    }

    // Create gradient
    var grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, `rgb(${this._colorTop})`);
    grd.addColorStop(0.5, `rgb(${this._colorMiddle})`);
    grd.addColorStop(1, `rgb(${this._colorBotttom})`);
    // grd.addColorStop(0, "red");
    // grd.addColorStop(0.5, "yellow");
    // grd.addColorStop(1, "green");
    ctx.fillStyle = grd;

    //taken from webamp classic
    const paddingLeft = 2; // TODO: This should be 1.5

    const min = 0;
    const max = h - 1;

    const xs: number[] = [];
    const ys: number[] = [];
    amplitudes.forEach((value, i) => {
      const percent = 1 - value;
      // Each band is 12 pixels widex
      xs.push(i * ((w - 2 * paddingLeft) / (10 - 1)));
      // xs.push(i * 12);
      ys.push(percentToRange(percent, min, max));
    });

    const allYs = spline(xs, ys);

    const maxX = xs[xs.length - 1];
    let lastY = ys[0];
    for (let x = 0; x <= maxX; x++) {
      const y = clamp(Math.round(allYs[x]), 0, h - 1);
      const yTop = Math.min(y, lastY);
      const height = 1 + Math.abs(lastY - y);
      ctx.fillRect(paddingLeft + x, yTop, 1, height);
      lastY = y;
    }

    // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // for (var i = 0; i < 60; i++) {
    //   var x = Math.floor(Math.random() * ctx.canvas.width - 1);
    //   var y = Math.floor(Math.random() * ctx.canvas.height - 1);
    //   var radius = Math.floor(Math.random() * 5);

    //   var r = Math.floor(Math.random() * 255);
    //   var g = Math.floor(Math.random() * 255);
    //   var b = Math.floor(Math.random() * 255);

    //   ctx.beginPath();
    //   ctx.arc(x, y, radius, Math.PI * 2, 0, false);
    //   //   ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ",1)";
    //   ctx.fill();
    //   ctx.closePath();
    // }
  };

  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "colortop":
        this._colorTop = value;
        break;
      case "colormiddle":
        this._colorMiddle = value;
        break;
      case "colorbottom":
        this._colorBotttom = value;
        break;
      case "colorpreamp":
        this._colorPreamp = value;
        break;
      default:
        return false;
    }
    return true;
  }

  _renderWidth() {
    super._renderWidth();
    this._canvas.style.width = this._div.style.width;
    // this._canvas.style.width = '72px';
    this._canvas.setAttribute("width", `${parseInt(this._div.style.width)}`);
  }

  _renderHeight() {
    super._renderHeight();
    this._canvas.style.height = this._div.style.height;
    // this._canvas.style.height = '16px';
    this._canvas.setAttribute("height", `${parseInt(this._div.style.height)}`);
  }

  draw() {
    super.draw();
    this._div.appendChild(this._canvas);
    this.update();
  }
  //setRegionFromMap(regionMap:Map, threshold:number)

  isinvalid(): boolean {
    return false;
  }
}

const percentToRange = (percent: number, min: number, max: number) =>
  min + Math.round(percent * (max - min));

function spline(xs, ys) {
  const ks = getNaturalKs(xs, ys);
  const maxX = xs[xs.length - 1];
  const allYs = [];
  let i = 1;
  for (let x = 0; x <= maxX; x++) {
    while (xs[i] < x) i++;
    const t = (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
    const a = ks[i - 1] * (xs[i] - xs[i - 1]) - (ys[i] - ys[i - 1]);
    const b = -ks[i] * (xs[i] - xs[i - 1]) + (ys[i] - ys[i - 1]);
    const q =
      (1 - t) * ys[i - 1] + t * ys[i] + t * (1 - t) * (a * (1 - t) + b * t);
    allYs.push(q);
  }
  return allYs;
}

function getNaturalKs(xs, ys) {
  const ks = xs.map(() => 0);
  const n = xs.length - 1;
  const matrix = zerosMatrix(n + 1, n + 2);

  for (
    let i = 1;
    i < n;
    i++ // rows
  ) {
    matrix[i][i - 1] = 1 / (xs[i] - xs[i - 1]);
    matrix[i][i] = 2 * (1 / (xs[i] - xs[i - 1]) + 1 / (xs[i + 1] - xs[i]));
    matrix[i][i + 1] = 1 / (xs[i + 1] - xs[i]);
    matrix[i][n + 1] =
      3 *
      ((ys[i] - ys[i - 1]) / ((xs[i] - xs[i - 1]) * (xs[i] - xs[i - 1])) +
        (ys[i + 1] - ys[i]) / ((xs[i + 1] - xs[i]) * (xs[i + 1] - xs[i])));
  }

  matrix[0][0] = 2 / (xs[1] - xs[0]);
  matrix[0][1] = 1 / (xs[1] - xs[0]);
  matrix[0][n + 1] =
    (3 * (ys[1] - ys[0])) / ((xs[1] - xs[0]) * (xs[1] - xs[0]));

  matrix[n][n - 1] = 1 / (xs[n] - xs[n - 1]);
  matrix[n][n] = 2 / (xs[n] - xs[n - 1]);
  matrix[n][n + 1] =
    (3 * (ys[n] - ys[n - 1])) / ((xs[n] - xs[n - 1]) * (xs[n] - xs[n - 1]));

  return solve(matrix, ks);
}

function solve(matrix, ks) {
  const m = matrix.length;
  // column
  for (let k = 0; k < m; k++) {
    // pivot for column
    let iMax = 0;
    let vali = Number.NEGATIVE_INFINITY;
    for (let i = k; i < m; i++)
      if (matrix[i][k] > vali) {
        iMax = i;
        vali = matrix[i][k];
      }
    swapRows(matrix, k, iMax);

    // for all rows below pivot
    for (let i = k + 1; i < m; i++) {
      for (let j = k + 1; j < m + 1; j++)
        matrix[i][j] =
          matrix[i][j] - matrix[k][j] * (matrix[i][k] / matrix[k][k]);
      matrix[i][k] = 0;
    }
  }
  // rows = columns
  for (let i = m - 1; i >= 0; i--) {
    const v = matrix[i][m] / matrix[i][i];
    ks[i] = v;
    // rows
    for (let j = i - 1; j >= 0; j--) {
      matrix[j][m] -= matrix[j][i] * v;
      matrix[j][i] = 0;
    }
  }
  return ks;
}

function zerosMatrix(rows, columns) {
  const matrix = [];
  for (let i = 0; i < rows; i++) {
    matrix.push([]);
    for (let j = 0; j < columns; j++) {
      matrix[i].push(0);
    }
  }
  return matrix;
}

function swapRows(m, k, l) {
  const p = m[k];
  m[k] = m[l];
  m[l] = p;
}
