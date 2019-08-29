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

  findobject(id: string) {
    return findDescendantByTypeAndId(this, null, id);
  }

  init(newRoot) {
    this.parent = newRoot;
    newRoot.js_addChild(this);
    return this;
  }

  setxmlparam(param: string, value: string) {
    this.attributes[param] = value;
    this.js_trigger("js_update");
    return value;
  }

  getxmlparam(param: string) {
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

  resize(x: number, y: number, w: number, h: number) {
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

  // alpha range from 0-255
  setalpha(alpha: number) {
    this.attributes.alpha = parseInt(alpha, 10) / 255;
    this.js_trigger("js_update");
  }

  isvisible() {
    unimplementedWarning("isvisible");
    return;
  }

  onsetvisible(onoff: boolean) {
    unimplementedWarning("onsetvisible");
    return;
  }

  getalpha() {
    unimplementedWarning("getalpha");
    return;
  }

  onleftbuttonup(x: number, y: number) {
    unimplementedWarning("onleftbuttonup");
    return;
  }

  onleftbuttondown(x: number, y: number) {
    unimplementedWarning("onleftbuttondown");
    return;
  }

  onrightbuttonup(x: number, y: number) {
    unimplementedWarning("onrightbuttonup");
    return;
  }

  onrightbuttondown(x: number, y: number) {
    unimplementedWarning("onrightbuttondown");
    return;
  }

  onrightbuttondblclk(x: number, y: number) {
    unimplementedWarning("onrightbuttondblclk");
    return;
  }

  onleftbuttondblclk(x: number, y: number) {
    unimplementedWarning("onleftbuttondblclk");
    return;
  }

  onmousemove(x: number, y: number) {
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

  setenabled(onoff: boolean) {
    unimplementedWarning("setenabled");
    return;
  }

  getenabled() {
    unimplementedWarning("getenabled");
    return;
  }

  onenable(onoff: boolean) {
    unimplementedWarning("onenable");
    return;
  }

  onresize(x: number, y: number, w: number, h: number) {
    unimplementedWarning("onresize");
    return;
  }

  ismouseover(x: number, y: number) {
    unimplementedWarning("ismouseover");
    return;
  }

  settargetx(x: number) {
    unimplementedWarning("settargetx");
    return;
  }

  settargety(y: number) {
    unimplementedWarning("settargety");
    return;
  }

  settargetw(w: number) {
    unimplementedWarning("settargetw");
    return;
  }

  settargeth(r: number) {
    unimplementedWarning("settargeth");
    return;
  }

  // alpha range from 0-255
  settargeta(alpha: number) {
    this.attributes.alpha = parseInt(alpha, 10) / 255;
    this.js_trigger("js_update");
  }

  settargetspeed(insecond: number) {
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

  reversetarget(reverse: number) {
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

  endmodal(retcode: number) {
    unimplementedWarning("endmodal");
    return;
  }

  findobjectxy(x: number, y: number) {
    unimplementedWarning("findobjectxy");
    return;
  }

  getname() {
    unimplementedWarning("getname");
    return;
  }

  clienttoscreenx(x: number) {
    unimplementedWarning("clienttoscreenx");
    return;
  }

  clienttoscreeny(y: number) {
    unimplementedWarning("clienttoscreeny");
    return;
  }

  clienttoscreenw(w: number) {
    unimplementedWarning("clienttoscreenw");
    return;
  }

  clienttoscreenh(h: number) {
    unimplementedWarning("clienttoscreenh");
    return;
  }

  screentoclientx(x: number) {
    unimplementedWarning("screentoclientx");
    return;
  }

  screentoclienty(y: number) {
    unimplementedWarning("screentoclienty");
    return;
  }

  screentoclientw(w: number) {
    unimplementedWarning("screentoclientw");
    return;
  }

  screentoclienth(h: number) {
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

  onchar(c: string) {
    unimplementedWarning("onchar");
    return;
  }

  onaccelerator(accel: string) {
    unimplementedWarning("onaccelerator");
    return;
  }

  ismouseoverrect() {
    unimplementedWarning("ismouseoverrect");
    return;
  }

  getinterface(interface_guid: string) {
    unimplementedWarning("getinterface");
    return;
  }

  onkeydown(vk_code: number) {
    unimplementedWarning("onkeydown");
    return;
  }

  onkeyup(vk_code: number) {
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
  sendaction(
    action: string,
    param: string,
    x: number,
    y: number,
    p1: number,
    p2: number
  ) {
    unimplementedWarning("sendaction");
    return;
  }

  /* eslint-disable-next-line max-params */
  onaction(
    action: string,
    param: string,
    x: number,
    y: number,
    p1: number,
    p2: number,
    source
  ) {
    unimplementedWarning("onaction");
    return;
  }
}

export default GuiObject;
