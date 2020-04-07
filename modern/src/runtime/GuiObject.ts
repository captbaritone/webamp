import MakiObject from "./MakiObject";
import {
  findDescendantByTypeAndId,
  findParentNodeOfType,
  baseImageAttributeFromObject,
  unimplementedWarning,
} from "../utils";
import { XmlNode } from "../types";

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
  constructor(
    node: XmlNode | null,
    parent: MakiObject | null,
    annotations: Object = {}
  ) {
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

  getxmlparam(param: string): string {
    return String(this.attributes[param]);
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
    if (this.attributes.h !== undefined) {
      return Number(this.attributes.h);
    }
    const baseImage = baseImageAttributeFromObject(this);
    if (baseImage) {
      // TODO: fix the type on this, we currently have better typing for this in
      // AnimatedLayer where we convert to _typedAttributes, as we apply that new
      // standard up to GuiObject/MakiObject we should be able to remove the ignore
      // @ts-ignore
      const image = this.attributes.js_assets[baseImage];
      if (image && image.h !== undefined) {
        return image.h;
      }
    }

    return 0;
  }

  getwidth(): number {
    if (this.attributes.w !== undefined) {
      return Number(this.attributes.w);
    }
    const baseImage = baseImageAttributeFromObject(this);
    if (baseImage) {
      // TODO: fix the type on this, we currently have better typing for this in
      // AnimatedLayer where we convert to _typedAttributes, as we apply that new
      // standard up to GuiObject/MakiObject we should be able to remove the ignore
      // @ts-ignore
      const image = this.attributes.js_assets[baseImage];
      if (image && image.w !== undefined) {
        return image.w;
      }
    }

    return 0;
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

  getalpha(): number {
    return unimplementedWarning("getalpha");
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

  setenabled(onoff: boolean): void {
    return unimplementedWarning("setenabled");
  }

  getenabled(): boolean {
    return unimplementedWarning("getenabled");
  }

  onenable(onoff: boolean): void {
    this.js_trigger("onEnable", onoff);
  }

  onresize(x: number, y: number, w: number, h: number): void {
    this.js_trigger("onResize", x, y, w, h);
  }

  ismouseover(x: number, y: number): boolean {
    return unimplementedWarning("ismouseover");
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
      (currentTime) => {
        const progress =
          (currentTime - this._targetAnimationStartTime) /
          this._targetAnimationSpeed;
        if (progress > 1) {
          this._targetParams = {};
          this.ontargetreached();
          return;
        }
        ANIMATION_PROP_KEYS.forEach((attr) => {
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
    ANIMATION_PROP_KEYS.forEach((attr) => {
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

  reversetarget(reverse: number): void {
    return unimplementedWarning("reversetarget");
  }

  onstartup(): void {
    this.js_trigger("onStartup");
  }

  isgoingtotarget(): boolean {
    return unimplementedWarning("isgoingtotarget");
  }

  bringtofront(): void {
    return unimplementedWarning("bringtofront");
  }

  bringtoback(): void {
    return unimplementedWarning("bringtoback");
  }

  bringabove(guiobj: GuiObject): void {
    return unimplementedWarning("bringabove");
  }

  bringbelow(guiobj: GuiObject): void {
    return unimplementedWarning("bringbelow");
  }

  getguix(): number {
    return unimplementedWarning("getguix");
  }

  getguiy(): number {
    return unimplementedWarning("getguiy");
  }

  getguiw(): number {
    return unimplementedWarning("getguiw");
  }

  getguih(): number {
    return unimplementedWarning("getguih");
  }

  getguirelatx(): number {
    return unimplementedWarning("getguirelatx");
  }

  getguirelaty(): number {
    return unimplementedWarning("getguirelaty");
  }

  getguirelatw(): number {
    return unimplementedWarning("getguirelatw");
  }

  getguirelath(): number {
    return unimplementedWarning("getguirelath");
  }

  isactive(): boolean {
    return unimplementedWarning("isactive");
  }

  gettopparent() {
    return unimplementedWarning("gettopparent");
  }

  runmodal(): number {
    return unimplementedWarning("runmodal");
  }

  endmodal(retcode: number): void {
    return unimplementedWarning("endmodal");
  }

  findobjectxy(x: number, y: number) {
    return unimplementedWarning("findobjectxy");
  }

  getname(): string {
    return unimplementedWarning("getname");
  }

  clienttoscreenx(x: number): number {
    return unimplementedWarning("clienttoscreenx");
  }

  clienttoscreeny(y: number): number {
    return unimplementedWarning("clienttoscreeny");
  }

  clienttoscreenw(w: number): number {
    return unimplementedWarning("clienttoscreenw");
  }

  clienttoscreenh(h: number): number {
    return unimplementedWarning("clienttoscreenh");
  }

  screentoclientx(x: number): number {
    return unimplementedWarning("screentoclientx");
  }

  screentoclienty(y: number): number {
    return unimplementedWarning("screentoclienty");
  }

  screentoclientw(w: number): number {
    return unimplementedWarning("screentoclientw");
  }

  screentoclienth(h: number): number {
    return unimplementedWarning("screentoclienth");
  }

  getautowidth(): number {
    return unimplementedWarning("getautowidth");
  }

  getautoheight(): number {
    return unimplementedWarning("getautoheight");
  }

  setfocus(): void {
    return unimplementedWarning("setfocus");
  }

  onchar(c: string): void {
    this.js_trigger("onChar", c);
  }

  onaccelerator(accel: string): void {
    this.js_trigger("onAccelerator", accel);
  }

  ismouseoverrect(): boolean {
    return unimplementedWarning("ismouseoverrect");
  }

  getinterface(interface_guid: string) {
    return unimplementedWarning("getinterface");
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
  ): number {
    return unimplementedWarning("sendaction");
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

  onmousewheelup(clicked: number, lines: number): number {
    return unimplementedWarning("onmousewheelup");
  }

  onmousewheeldown(clicked: number, lines: number): number {
    return unimplementedWarning("onmousewheeldown");
  }

  ondragenter(): void {
    return unimplementedWarning("ondragenter");
  }

  ondragover(x: number, y: number): void {
    return unimplementedWarning("ondragover");
  }

  ondragleave(): void {
    return unimplementedWarning("ondragleave");
  }
}

export default GuiObject;
