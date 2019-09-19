import MakiObject from "./MakiObject";
import {
  findDescendantByTypeAndId,
  findParentNodeOfType,
  unimplementedWarning,
} from "../utils";
import { ModernStore, XmlNode } from "../types";

type TargetParams = {
  alpha?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
};

type TransitionParams = {
  alpha?: { start: number; end: number };
  x?: { start: number; end: number };
  y?: { start: number; end: number };
  w?: { start: number; end: number };
  h?: { start: number; end: number };
};

type AnimationPropKeys = "alpha" | "x" | "y" | "w" | "h";

const ANIMATION_PROP_KEYS: AnimationPropKeys[] = ["alpha", "x", "y", "w", "h"];

class GuiObject extends MakiObject {
  visible: boolean;
  _targetAnimationSpeed: number;
  _targetParams: TargetParams;
  _transitionParams: TransitionParams;
  _targetAnimationStartTime: number;
  _targetAnimationCancelID: number | null;
  constructor(node: XmlNode, parent: MakiObject, annotations: Object = {}) {
    super(node, parent, annotations);

    this._setAttributeDefaults();
    this._convertAttributeTypes();

    this.visible = true;
    this._targetAnimationSpeed = 0;
    this._targetParams = {};
    this._transitionParams = {};
    this._targetAnimationStartTime = 0;
    this._targetAnimationCancelID = null;
  }

  _setAttributeDefaults() {
    if (this.attributes.alpha == null) {
      this.attributes.alpha = "255";
    }
    if (this.attributes.x == null) {
      this.attributes.x = "0";
    }
    if (this.attributes.y == null) {
      this.attributes.y = "0";
    }
    if (this.attributes.ghost == null) {
      this.attributes.ghost = "0";
    }
  }

  _convertAttributeTypes() {
    const { attributes } = this;
    if (attributes.alpha != null) {
      attributes.alpha = Number(attributes.alpha);
    }
    if (attributes.x != null) {
      attributes.x = Number(attributes.x);
    }
    if (attributes.y != null) {
      attributes.y = Number(attributes.y);
    }
    if (attributes.ghost != null) {
      attributes.ghost = !!Number(attributes.ghost);
    }
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
    const self: MakiObject = this;
    return findDescendantByTypeAndId(self, null, id);
  }

  init(newRoot: MakiObject): void {
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

  // TODO: Make this return a `Layout` once `Layout` is typed.
  getparentlayout(): MakiObject | null {
    const self: MakiObject = this;
    return findParentNodeOfType(self, new Set(["layout"]));
  }

  show(): void {
    this.visible = true;
    this.js_trigger("js_update");
  }

  hide(): void {
    this.visible = false;
    this.js_trigger("js_update");
  }

  gettop(): number {
    return Number(this.attributes.y) || 0;
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

  settargetx(x: number): void {
    this._targetParams.x = x;
  }

  settargety(y: number): void {
    this._targetParams.y = y;
  }

  settargetw(w: number): void {
    this._targetParams.w = w;
  }

  // r? OK...
  settargeth(r: number): void {
    this._targetParams.h = r;
  }

  // alpha range from 0-255
  settargeta(alpha: number): void {
    this._targetParams.alpha = alpha;
  }

  settargetspeed(insecond: number): void {
    this._targetAnimationSpeed = insecond * 1000;
  }

  _targetAnimationLoop(): void {
    this._targetAnimationCancelID = window.requestAnimationFrame(
      currentTime => {
        const progress =
          (currentTime - this._targetAnimationStartTime) /
          this._targetAnimationSpeed;
        if (progress > 1) {
          this._targetParams = {};
          this.ontargetreached();
          return;
        }
        ANIMATION_PROP_KEYS.forEach(attr => {
          const transition = this._transitionParams[attr];
          if (transition == null) {
            return;
          }
          const { start, end } = transition;
          this.attributes[attr] = end * progress + start * (1 - progress);
        });
        this.js_trigger("js_update");
        this._targetAnimationLoop();
      }
    );
  }

  gototarget(): void {
    this._transitionParams = {};
    ANIMATION_PROP_KEYS.forEach(attr => {
      const target = this._targetParams[attr];
      if (target == null) {
        return;
      }

      const attribute = this.attributes[attr];

      this._transitionParams[attr] = {
        start: attribute != null ? Number(attribute) : target,
        end: target,
      };
    });

    this._targetAnimationStartTime = window.performance.now();
    this._targetAnimationLoop();
  }

  ontargetreached(): void {
    this.js_trigger("onTargetReached");
  }

  canceltarget(): void {
    if (this._targetAnimationCancelID != null) {
      window.cancelAnimationFrame(this._targetAnimationCancelID);
    }
    this._targetAnimationCancelID = null;
    this._targetParams = {};
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

  bringabove(guiobj: GuiObject) {
    unimplementedWarning("bringabove");
    return;
  }

  bringbelow(guiobj: GuiObject) {
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
    source: GuiObject
  ): number {
    unimplementedWarning("onaction");
    this.js_trigger("onAction", action, param, x, y, p1, p2, source);
    // TODO: not sure what we shuld return
    return 0;
  }
}

export default GuiObject;
