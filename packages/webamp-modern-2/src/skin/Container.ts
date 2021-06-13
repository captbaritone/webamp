import { toBool } from "../utils";
import Group from "./Group";
import Layout from "./Layout";
import XmlObj from "./XmlObj";

export default class Container extends XmlObj {
  _layouts: Layout[] = [];
  _defaultVisible: boolean = true;
  constructor() {
    super();
  }

  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "default_visible":
        this._defaultVisible = toBool(value);
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
    if (this._defaultVisible) {
      for (const layout of this._layouts) {
        div.appendChild(layout.getDebugDom());
      }
    }
    return div;
  }
}
