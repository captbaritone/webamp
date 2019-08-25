import MakiObject from "./MakiObject";
import {
  findDescendantByTypeAndId,
  findParentNodeOfType,
  unimplementedWarning,
} from "../utils";
import * as MakiSelectors from "../MakiSelectors";

class GuiObject extends MakiObject {
  constructor(node, parent, annotations, store) {
    super(node, parent, annotations, store);

    this.visible = true;
    this._selectorCache = new Map();
  }

  _useUidSelector(selector) {
    // TODO: use memoize for this
    if (!this._selectorCache.has(selector)) {
      this._selectorCache.set(selector, selector(this._uid));
    }
    return this._selectorCache.get(selector)(this._store.getState());
  }

  _compareToUidSelector(value, selector) {
    const selectorValue = this._useUidSelector(selector);
    if (selectorValue !== value) {
      console.error(
        `Maki state ${value} is out of sync with tree state ${selectorValue}`
      );
    }
    return value;
  }

  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "GuiObject";
  }

  findobject(id) {
    return findDescendantByTypeAndId(this, null, id);
  }

  init(newRoot) {
    this.parent = newRoot;
    newRoot.js_addChild(this);
    return this;
  }

  setxmlparam(param, value) {
    this.attributes[param] = value;
    this.js_trigger("js_update");
    return value;
  }

  getxmlparam(param) {
    return this.attributes[param];
  }

  getparent() {
    return this.parent;
  }

  getparentlayout() {
    return findParentNodeOfType(this, new Set(["layout"]));
  }

  show() {
    this.visible = true;
    this.parent.js_trigger("js_update");
  }

  hide() {
    this.visible = false;
    this.parent.js_trigger("js_update");
  }

  gettop() {
    return this._compareToUidSelector(
      Number(this.attributes.y) || 0,
      MakiSelectors.getTop
    );
  }

  getleft() {
    return Number(this.attributes.x) || 0;
  }

  getheight() {
    // TODO
    // I don't know how it gets calculated exactly, but if a node has a minimum
    // and maximum h, but no h, getwidth still returns a value, return min for now
    return Number(this.attributes.h) || Number(this.attributes.minimum_h) || 0;
  }

  getwidth() {
    // TODO
    // I don't know how it gets calculated exactly, but if a node has a minimum
    // and maximum w, but no w, getwidth still returns a value, return min for now
    return Number(this.attributes.w) || Number(this.attributes.minimum_w) || 0;
  }

  resize(x, y, w, h) {
    this.attributes.x = x;
    this.attributes.y = y;
    this.attributes.w = w;
    this.attributes.h = h;
    // TODO: Confirm that GuiObject actually supports these min/max attributes
    this.attributes.minimum_w = w;
    this.attributes.maximum_w = w;
    this.attributes.minimum_h = h;
    this.attributes.maximum_h = h;
  }

  setalpha(alpha) {
    unimplementedWarning("setAlpha");
  }

  isvisible() {
    unimplementedWarning("isvisible");
    return;
  }

  onsetvisible(onoff) {
    unimplementedWarning("onsetvisible");
    return;
  }

  getalpha() {
    unimplementedWarning("getalpha");
    return;
  }

  onleftbuttonup(x, y) {
    unimplementedWarning("onleftbuttonup");
    return;
  }

  onleftbuttondown(x, y) {
    unimplementedWarning("onleftbuttondown");
    return;
  }

  onrightbuttonup(x, y) {
    unimplementedWarning("onrightbuttonup");
    return;
  }

  onrightbuttondown(x, y) {
    unimplementedWarning("onrightbuttondown");
    return;
  }

  onrightbuttondblclk(x, y) {
    unimplementedWarning("onrightbuttondblclk");
    return;
  }

  onleftbuttondblclk(x, y) {
    unimplementedWarning("onleftbuttondblclk");
    return;
  }

  onmousemove(x, y) {
    unimplementedWarning("onmousemove");
    return;
  }

  onenterarea() {
    unimplementedWarning("onenterarea");
    return;
  }

  onleavearea() {
    unimplementedWarning("onleavearea");
    return;
  }

  setenabled(onoff) {
    unimplementedWarning("setenabled");
    return;
  }

  getenabled() {
    unimplementedWarning("getenabled");
    return;
  }

  onenable(onoff) {
    unimplementedWarning("onenable");
    return;
  }

  onresize(x, y, w, h) {
    unimplementedWarning("onresize");
    return;
  }

  ismouseover(x, y) {
    unimplementedWarning("ismouseover");
    return;
  }

  settargetx(x) {
    unimplementedWarning("settargetx");
    return;
  }

  settargety(y) {
    unimplementedWarning("settargety");
    return;
  }

  settargetw(w) {
    unimplementedWarning("settargetw");
    return;
  }

  settargeth(r) {
    unimplementedWarning("settargeth");
    return;
  }

  settargeta(alpha) {
    unimplementedWarning("settargeta");
    return;
  }

  settargetspeed(insecond) {
    unimplementedWarning("settargetspeed");
    return;
  }

  gototarget() {
    unimplementedWarning("gototarget");
    return;
  }

  ontargetreached() {
    unimplementedWarning("ontargetreached");
    return;
  }

  canceltarget() {
    unimplementedWarning("canceltarget");
    return;
  }

  reversetarget(reverse) {
    unimplementedWarning("reversetarget");
    return;
  }

  onstartup() {
    unimplementedWarning("onstartup");
    return;
  }

  isgoingtotarget() {
    unimplementedWarning("isgoingtotarget");
    return;
  }

  bringtofront() {
    unimplementedWarning("bringtofront");
    return;
  }

  bringtoback() {
    unimplementedWarning("bringtoback");
    return;
  }

  bringabove(guiobj) {
    unimplementedWarning("bringabove");
    return;
  }

  bringbelow(guiobj) {
    unimplementedWarning("bringbelow");
    return;
  }

  getguix() {
    unimplementedWarning("getguix");
    return;
  }

  getguiy() {
    unimplementedWarning("getguiy");
    return;
  }

  getguiw() {
    unimplementedWarning("getguiw");
    return;
  }

  getguih() {
    unimplementedWarning("getguih");
    return;
  }

  getguirelatx() {
    unimplementedWarning("getguirelatx");
    return;
  }

  getguirelaty() {
    unimplementedWarning("getguirelaty");
    return;
  }

  getguirelatw() {
    unimplementedWarning("getguirelatw");
    return;
  }

  getguirelath() {
    unimplementedWarning("getguirelath");
    return;
  }

  isactive() {
    unimplementedWarning("isactive");
    return;
  }

  gettopparent() {
    unimplementedWarning("gettopparent");
    return;
  }

  runmodal() {
    unimplementedWarning("runmodal");
    return;
  }

  endmodal(retcode) {
    unimplementedWarning("endmodal");
    return;
  }

  findobjectxy(x, y) {
    unimplementedWarning("findobjectxy");
    return;
  }

  getname() {
    unimplementedWarning("getname");
    return;
  }

  clienttoscreenx(x) {
    unimplementedWarning("clienttoscreenx");
    return;
  }

  clienttoscreeny(y) {
    unimplementedWarning("clienttoscreeny");
    return;
  }

  clienttoscreenw(w) {
    unimplementedWarning("clienttoscreenw");
    return;
  }

  clienttoscreenh(h) {
    unimplementedWarning("clienttoscreenh");
    return;
  }

  screentoclientx(x) {
    unimplementedWarning("screentoclientx");
    return;
  }

  screentoclienty(y) {
    unimplementedWarning("screentoclienty");
    return;
  }

  screentoclientw(w) {
    unimplementedWarning("screentoclientw");
    return;
  }

  screentoclienth(h) {
    unimplementedWarning("screentoclienth");
    return;
  }

  getautowidth() {
    unimplementedWarning("getautowidth");
    return;
  }

  getautoheight() {
    unimplementedWarning("getautoheight");
    return;
  }

  setfocus() {
    unimplementedWarning("setfocus");
    return;
  }

  onchar(c) {
    unimplementedWarning("onchar");
    return;
  }

  onaccelerator(accel) {
    unimplementedWarning("onaccelerator");
    return;
  }

  ismouseoverrect() {
    unimplementedWarning("ismouseoverrect");
    return;
  }

  getinterface(interface_guid) {
    unimplementedWarning("getinterface");
    return;
  }

  onkeydown(vk_code) {
    unimplementedWarning("onkeydown");
    return;
  }

  onkeyup(vk_code) {
    unimplementedWarning("onkeyup");
    return;
  }

  ongetfocus() {
    unimplementedWarning("ongetfocus");
    return;
  }

  onkillfocus() {
    unimplementedWarning("onkillfocus");
    return;
  }

  /* eslint-disable-next-line max-params */
  sendaction(action, param, x, y, p1, p2) {
    unimplementedWarning("sendaction");
    return;
  }

  /* eslint-disable-next-line max-params */
  onaction(action, param, x, y, p1, p2, source) {
    unimplementedWarning("onaction");
    return;
  }
}

export default GuiObject;
