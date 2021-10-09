import UI_ROOT from "../../UIRoot";
import { assert, px, removeAllChildNodes, toBool } from "../../utils";
import Layout from "./Layout";
import XmlObj from "../XmlObj";

// > A container is a top level object and it basically represents a window.
// > Nothing holds a container. It is an object that holds multiple related
// > layouts. Each layout represents an appearance for that window. You can design
// > different layouts for each window but only one can be visible at a time.
//
// -- http://wiki.winamp.com/wiki/Modern_Skin:_Container
export default class Container extends XmlObj {
  static GUID = "e90dc47b4ae7840d0b042cb0fcf775d2";
  _layouts: Layout[] = [];
  _activeLayout: Layout | null = null;
  _defaultVisible: boolean = true;
  _id: string;
  _div: HTMLDivElement = document.createElement("div");
  constructor() {
    super();
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "id":
        this._id = value.toLowerCase();
        break;
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

  getId() {
    return this._id;
  }

  getDiv(): HTMLDivElement {
    return this._div;
  }

  getWidth(): number {
    return this._activeLayout.getwidth();
  }
  getHeight(): number {
    return this._activeLayout.getheight();
  }

  center() {
    const height = document.documentElement.clientHeight;
    const width = document.documentElement.clientWidth;
    this._div.style.top = px((height - this.getHeight()) / 2);
    this._div.style.left = px((width - this.getWidth()) / 2);
  }

  /* Required for Maki */
  /**
   * Get the layout associated with the an id.
   * This corresponds to the "id=..." attribute in
   * the XML tag <layout .. />.
   *
   *  @ret             The layout associated with the id.
   * @param  layout_id   The id of the layout you wish to retrieve.
   */
  getlayout(layoutId: string): Layout {
    const lower = layoutId.toLowerCase();
    for (const layout of this._layouts) {
      if (layout.getId() === lower) {
        return layout;
      }
    }
    throw new Error(`Could not find a container with the id; "${layoutId}"`);
  }

  addLayout(layout: Layout) {
    layout.setParentContainer(this);
    this._layouts.push(layout);
    if (this._activeLayout == null) {
      this._activeLayout = layout;
    }
  }

  _clearCurrentLayout() {
    removeAllChildNodes(this._div);
  }

  setLayout(id: string) {
    const layout = this.getlayout(id);
    assert(layout != null, `Could not find layout with id "${id}".`);
    UI_ROOT.vm.dispatch(this, "onswitchtolayout", [
      { type: "OBJECT", value: this._activeLayout },
      { type: "OBJECT", value: layout },
    ]);
    this._activeLayout = layout;
    this._clearCurrentLayout();
    this._renderLayout();
    UI_ROOT.vm.dispatch(this, "onswitchtolayout", [
      { type: "OBJECT", value: layout },
    ]);
  }

  dispatchAction(
    action: string,
    param: string | null,
    actionTarget: string | null
  ) {
    switch (action) {
      case "SWITCH":
        this.setLayout(param);
        break;
      default:
        UI_ROOT.dispatch(action, param, actionTarget);
    }
  }

  _renderLayout() {
    if (this._defaultVisible && this._activeLayout) {
      this._activeLayout.draw();
      this._div.appendChild(this._activeLayout.getDiv());
      // this.center();
    } else {
      removeAllChildNodes(this._div);
    }
  }

  draw() {
    this._div.setAttribute("data-xml-id", this.getId());
    this._div.setAttribute("data-obj-name", "Container");
    this._div.style.position = "absolute";
    this._renderLayout();
  }
}
