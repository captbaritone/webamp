import { UIRoot } from "../../UIRoot";
import { assert, num, px, removeAllChildNodes, toBool } from "../../utils";
import Layout from "./Layout";
import XmlObj from "../XmlObj";
import Group from "./Group";

// > A container is a top level object and it basically represents a window.
// > Nothing holds a container. It is an object that holds multiple related
// > layouts. Each layout represents an appearance for that window. You can design
// > different layouts for each window but only one can be visible at a time.
//
// -- http://wiki.winamp.com/wiki/Modern_Skin:_Container
export default class Container extends XmlObj {
  static GUID = "e90dc47b4ae7840d0b042cb0fcf775d2";
  _uiRoot: UIRoot;
  _layouts: Layout[] = [];
  _activeLayout: Layout | null = null;
  _visible: boolean = true;
  _id: string;
  _originalId: string; // non lowercase'd
  _name: string;
  _x: number = 0;
  _y: number = 0;
  _componentGuid: string; // eg. "guid:{1234-...-0ABC}"
  _componentAlias: string; // eg. "guid:pl"
  _div: HTMLElement = document.createElement("container");

  constructor(uiRoot: UIRoot) {
    super();
    this._uiRoot = uiRoot;
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "name":
        // this._name = value;
        this.setname(value)
        break;
      case "id":
        this._originalId = value;
        this._id = value.toLowerCase();
        break;
      case "component":
        this._componentGuid = value.toLowerCase().split(":")[1];
        this.resolveAlias();
        break;
      case "default_visible":
        // allow @HAVE_LIBRARY@ (for now, its recognized as "false")
        this._visible = value == "1";
        break;
      case "x":
      case "default_x":
        this._x = num(value) ?? 0;
        this._renderDimensions();
        break;
      case "y":
      case "default_y":
        this._y = num(value) ?? 0;
        this._renderDimensions();
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
    // maki need 'onswitchtolayout':
    // this.switchtolayout(this.getcurlayout().getId())
    this._uiRoot.vm.dispatch(this, "onswitchtolayout", [
      { type: "OBJECT", value: this.getcurlayout() },
    ]);
  }

  dispose() {
    for (const layout of this._layouts) {
      layout.dispose();
    }
  }

  setname(name:string) {
    this._name = name;
  }
  getname(): string {
    return this._name;
  }
  getguid(): string {
    return this._componentGuid;
  }

  resolveAlias() {
    const knownContainerGuids = {
      "{0000000a-000c-0010-ff7b-01014263450c}": "vis", // visualization
      "{45f3f7c1-a6f3-4ee6-a15e-125e92fc3f8d}": "pl", // playlist editor
      "{6b0edf80-c9a5-11d3-9f26-00c04f39ffc6}": "ml", // media library
      "{7383a6fb-1d01-413b-a99a-7e6f655f4591}": "con", // config?
      "{7a8b2d76-9531-43b9-91a1-ac455a7c8242}": "lir", // lyric?
      "{a3ef47bd-39eb-435a-9fb3-a5d87f6f17a5}": "dl", // download??
      "{f0816d7b-fffc-4343-80f2-e8199aa15cc3}": "video", // independent video window
    };
    const guid = this._componentGuid;
    this._componentAlias = knownContainerGuids[guid];
    if (this._componentGuid && !this._componentAlias) {
      console.warn(
        `unknown component alias for guid:${this._componentGuid}`,
        `for id:${this.getId()}`
      );
    }
  }

  /**
   * Container sometime identified with a guid, or a-guid alias
   * so which one correct (id, 'guid:{abcde}, 'guid:pl') is acceptable.
   */
  hasId(id: string): boolean {
    if (!id) return false;
    id = id.toLowerCase();
    const useGuid = id.startsWith("guid:");
    if (useGuid) {
      id = id.substring(5);
      return this._componentGuid == id || this._componentAlias == id;
    } else {
      return this._id == id;
    }
  }
  getId() {
    return this._id;
  }
  getOriginalId(): string {
    return this._originalId;
  }

  getDiv(): HTMLElement {
    return this._div;
  }

  getWidth(): number {
    return this._activeLayout.getwidth();
  }
  getHeight(): number {
    return this._activeLayout.getheight();
  }

  gettop(): number {
    return this._y;
  }

  getleft(): number {
    return this._x;
  }

  center() {
    const height = document.documentElement.clientHeight;
    const width = document.documentElement.clientWidth;
    this._div.style.top = px((height - this.getHeight()) / 2);
    this._div.style.left = px((width - this.getWidth()) / 2);
  }

  setLocation(x: number, y: number) {
    if (x == this._x && y == this._y) {
      return;
    }
    this._x = x;
    this._y = y;
    this._renderDimensions();
  }

  show() {
    if (!this._activeLayout) {
      this.switchtolayout(this._layouts[0]._id);
    }
    this._visible = true;
    this._renderLayout();
  }
  hide() {
    this._visible = false;
    this._renderLayout();
  }
  toggle() {
    if (!this._visible) this.show();
    else this.hide();
  }
  close() {
    this._activeLayout = null;
    this.hide();
  }
  getVisible(): boolean {
    return this._visible;
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

  /**
   * @ret Layout
   */
  getcurlayout(): Layout {
    return this._activeLayout;
  }

  addLayout(layout: Layout) {
    layout.setParent(this as unknown as Group);
    this._layouts.push(layout);
    if (this._activeLayout == null) {
      this._activeLayout = layout;
    }
  }

  getnumlayouts(): number {
    return this._layouts.length;
  }

  enumlayout(num: number): Layout {
    return this._layouts[num];
  }

  // parser need it.
  addChild(layout: Layout) {
    this.addLayout(layout);
  }

  _clearCurrentLayout() {
    removeAllChildNodes(this._div);
    // this._div.removeChild(this._activeLayout.getDiv())
  }

  switchtolayout(layout_id: string) {
    const layout = this.getlayout(layout_id);
    assert(layout != null, `Could not find layout with id "${layout_id}".`);
    this._uiRoot.vm.dispatch(this, "onswitchtolayout", [
      { type: "OBJECT", value: layout },
    ]);
    this._clearCurrentLayout();
    this._activeLayout = layout;
    this._renderLayout();
  }

  dispatchAction(
    action: string,
    param: string | null,
    actionTarget: string | null
  ) {
    switch (action) {
      case "SWITCH":
        this.switchtolayout(param);
        break;
      default:
        this._uiRoot.dispatch(action, param, actionTarget);
    }
  }

  _renderDimensions() {
    this._div.style.left = px(this._x);
    this._div.style.top = px(this._y);
  }

  _renderLayout() {
    if (this._visible && this._activeLayout) {
      // this._activeLayout.draw();
      this._div.appendChild(this._activeLayout.getDiv());
      // this.center();
    } else {
      this._clearCurrentLayout();
    }
  }

  _renderLayouts() {
    for (const layout of this._layouts) {
      layout.draw();
    }
  }

  draw() {
    this.getId() && this._div.setAttribute("id", this.getId());
    this._div.setAttribute("tabindex", "1");
    this._renderDimensions();
    this._renderLayouts();
    this._renderLayout();
  }
}
