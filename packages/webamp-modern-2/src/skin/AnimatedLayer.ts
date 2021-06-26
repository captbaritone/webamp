import Layer from "./Layer";

export default class AnimatedLayer extends Layer {
  setXmlAttr(key: string, value: string): boolean {
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

  getDebugDom(): HTMLDivElement {
    const div = super.getDebugDom();

    div.setAttribute("data-obj-name", "AnimatedLayer");
    return div;
  }
}
