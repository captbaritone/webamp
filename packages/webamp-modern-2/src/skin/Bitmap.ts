export default class Bitmap {
  _id: string;
  _url: string;
  _x: number;
  _y: number;
  _width: number;
  _height: number;

  constructor({
    id,
    url,
    x,
    y,
    width,
    height,
  }: {
    id: string;
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    this._id = id;
    this._url = url;
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
  }
}
