import MakiObject from "./MakiObject";
import {
  findDescendantByTypeAndId,
  findParentNodeOfType,
  unimplementedWarning,
} from "../utils";
import * as MakiSelectors from "../MakiSelectors";

class GuiObject extends MakiObject {
  visible: boolean;
  constructor(node, parent, annotations, store) {
    super(node, parent, annotations, store);

    this._setAttributeDefaults(this.attributes);
    this._convertAttributeTypes(this.attributes);

    this.visible = true;
    this._selectorCache = new Map();
  }

  _setAttributeDefaults(attributes) {
    if (attributes.alpha == null) {
      attributes.alpha = "255";
    }
    if (attributes.ghost == null) {
      attributes.ghost = "0";
    }
  }

  _convertAttributeTypes(attributes) {
    if (attributes.alpha != null) {
      attributes.alpha = Number(attributes.alpha);
    }
    if (attributes.ghost != null) {
      attributes.ghost = !!Number(attributes.ghost);
    }
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

  init(newRoot): void {
    this.parent = newRoot;
    newRoot.js_addChild(this);
  }

  setxmlparam(param: string, value: string): void {
    this.attributes[param] = value;
    this.js_trigger("js_update");
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

  show(): void {
    this.visible = true;
    this.parent.js_trigger("js_update");
  }

  hide(): void {
    this.visible = false;
    this.parent.js_trigger("js_update");
  }

  gettop(): number {
    return this._compareToUidSelector(
      Number(this.attributes.y) || 0,
      MakiSelectors.getTop
    );
  }

  getleft(): number {
    return Number(this.attributes.x) || 0;
  }

  getheight(): number {
    // TODO
    // I don't know how it gets calculated exactly, but if a node has a minimum
    // and maximum h, but no h, getwidth still returns a value, return min for now
    return Number(this.attributes.h) || Number(this.attributes.minimum_h) || 0;
  }

  getwidth(): number {
    // TODO
    // I don't know how it gets calculated exactly, but if a node has a minimum
    // and maximum w, but no w, getwidth still returns a value, return min for now
    return Number(this.attributes.w) || Number(this.attributes.minimum_w) || 0;
  }

  resize(x: number, y: number, w: number, h: number): void {
    this.attributes.x = x;
    this.attributes.y = y;
    this.attributes.w = w;
    this.attributes.h = h;
    // TODO: Confirm that GuiObject actually supports these min/max attributes
    this.attributes.minimum_w = w;
    this.attributes.maximum_w = w;
    this.attributes.minimum_h = h;
    this.attributes.maximum_h = h;
    this.js_trigger("js_update");
  }

  // alpha range from 0-255
  setalpha(alpha: number): void {
    this.attributes.alpha = alpha;
    this.js_trigger("js_update");
  }

  isvisible(): number {
    return this.visible ? 1 : 0;
  }

  onsetvisible(onoff: boolean): void {
    this.js_trigger("onSetVisible", onoff);
  }

  getalpha() {
    unimplementedWarning("getalpha");
    return;
  }

  onleftbuttonup(x: number, y: number): void {
    this.js_trigger("onLeftButtonUp", x, y);
  }

  onleftbuttondown(x: number, y: number): void {
    this.js_trigger("onLeftButtonDown", x, y);
  }

  onrightbuttonup(x: number, y: number): void {
    this.js_trigger("onRightButtonUp", x, y);
  }

  onrightbuttondown(x: number, y: number): void {
    this.js_trigger("onRightButtonDown", x, y);
  }

  onrightbuttondblclk(x: number, y: number): void {
    this.js_trigger("onRightButtonDblClk", x, y);
  }

  onleftbuttondblclk(x: number, y: number): void {
    this.js_trigger("onLeftButtonDblClk", x, y);
  }

  onmousemove(x: number, y: number): void {
    this.js_trigger("onMouseMove", x, y);
  }

  onenterarea(): void {
    this.js_trigger("onEnterArea");
  }

  onleavearea(): void {
    this.js_trigger("onLeaveArea");
  }

  setenabled(onoff: boolean) {
    unimplementedWarning("setenabled");
    return;
  }

  getenabled() {
    unimplementedWarning("getenabled");
    return;
  }

  onenable(onoff: boolean): void {
    this.js_trigger("onEnable", onoff);
  }

  onresize(x: number, y: number, w: number, h: number): void {
    this.js_trigger("onResize", x, y, w, h);
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
  settargeta(alpha: number): void {
    unimplementedWarning("settargeta");
    this.attributes.alpha = alpha;
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

  ontargetreached(): void {
    this.js_trigger("onTargetReached");
  }

  canceltarget() {
    unimplementedWarning("canceltarget");
    return;
  }

  reversetarget(reverse: number) {
    unimplementedWarning("reversetarget");
    return;
  }

  onstartup(): void {
    this.js_trigger("onStartup");
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

  onchar(c: string): void {
    this.js_trigger("onChar", c);
  }

  onaccelerator(accel: string): void {
    this.js_trigger("onAccelerator", accel);
  }

  ismouseoverrect() {
    unimplementedWarning("ismouseoverrect");
    return;
  }

  getinterface(interface_guid: string) {
    unimplementedWarning("getinterface");
    return;
  }

  onkeydown(vk_code: number): void {
    this.js_trigger("onKeyDown", vk_code);
  }

  onkeyup(vk_code: number): void {
    this.js_trigger("onKeyUp", vk_code);
  }

  ongetfocus(): void {
    this.js_trigger("onGetFocus");
  }

  onkillfocus(): void {
    this.js_trigger("onKillFocus");
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
  ): number {
    unimplementedWarning("onaction");
    this.js_trigger("onAction", action, param, x, y, p1, p2, source);
    // TODO: not sure what we shuld return
    return 0;
  }
}

export default GuiObject;
