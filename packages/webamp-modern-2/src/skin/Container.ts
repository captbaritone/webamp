import { toBool } from "../utils";
import Group from "./Group";
import Layout from "./Layout";
import XmlObj from "./XmlObj";

// > A container is a top level object and it basically represents a window.
// > Nothing holds a container. It is an object that holds multiple related
// > layouts. Each layout represents an appearance for that window. You can design
// > different layouts for each window but only one can be visible at a time.
//
// -- http://wiki.winamp.com/wiki/Modern_Skin:_Container
export default class Container extends XmlObj {
  _layouts: Layout[] = [];
  _activeLayout: Layout | null = null;
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
        break;
      default:
        return false;
    }
    return true;
  }

  init() {
    for (const layout of this._layouts) {
      layout.init();
    }
  }

  addLayout(layout: Layout) {
    layout.setParent(this);
    this._layouts.push(layout);
    this._activeLayout = layout;
  }

  getDebugDom(): HTMLDivElement {
    const div = window.document.createElement("div");
    if (this._defaultVisible && this._activeLayout) {
      div.appendChild(this._activeLayout.getDebugDom());
    }
    return div;
  }
}
