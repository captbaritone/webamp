import Group from "./Group";
import Layout from "./Layout";
import XmlObj from "./XmlObj";

export default class Container extends XmlObj {
  _layouts: Layout[] = [];
  constructor() {
    super();
  }

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

  addLayout(layout: Layout) {
    layout.setParent(this);
    this._layouts.push(layout);
  }

  getDebugDom(): HTMLDivElement {
    const div = window.document.createElement("div");
    for (const layout of this._layouts) {
      div.appendChild(layout.getDebugDom());
    }
    return div;
  }
}
