import Layer from "./Layer";

export default class AnimatedLayer extends Layer {
  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      default:
        return false;
    }
    return true;
  }
  getlength(): number {
    return 10;
  }
  gotoframe(framenum: number) {}

  draw() {
    super.draw();
    this._div.setAttribute("data-obj-name", "AnimatedLayer");
  }
}
