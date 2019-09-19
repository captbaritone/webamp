import MakiObject from "./MakiObject";
import { findDescendantByTypeAndId, unimplementedWarning } from "../utils";

class Container extends MakiObject {
  visible: boolean;
  constructor(node, parent) {
    super(node, parent);

    this.visible = true;
  }

  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Container";
  }

  show(): void {
    this.visible = true;
    this.js_trigger("js_update");
  }

  hide(): void {
    this.visible = false;
    this.js_trigger("js_update");
  }

  setxmlparam(param: string, value: string): void {
    this.attributes[param] = value;
    this.js_trigger("js_update");
  }

  getlayout(id: string) {
    return findDescendantByTypeAndId(this, "layout", id);
  }

  onswitchtolayout(newlayout): void {
    this.js_trigger("onSwitchToLayout", newlayout);
  }

  onbeforeswitchtolayout(oldlayout, newlayout): void {
    this.js_trigger("onBeforeSwitchToLayout", oldlayout, newlayout);
  }

  onhidelayout(_layout): void {
    this.js_trigger("onHideLayout", _layout);
  }

  onshowlayout(_layout): void {
    this.js_trigger("onShowLayout", _layout);
  }

  getnumlayouts() {
    unimplementedWarning("getnumlayouts");
    return;
  }

  enumlayout(num: number) {
    unimplementedWarning("enumlayout");
    return;
  }

  switchtolayout(layout_id: string) {
    unimplementedWarning("switchtolayout");
    return;
  }

  close() {
    unimplementedWarning("close");
    return;
  }

  toggle() {
    unimplementedWarning("toggle");
    return;
  }

  isdynamic() {
    unimplementedWarning("isdynamic");
    return;
  }

  setname(name: string) {
    unimplementedWarning("setname");
    return;
  }

  getcurlayout() {
    unimplementedWarning("getcurlayout");
    // TODO: For now we just always show the first layout. I think that's the default.
    return this.js_getChildren().find(childNode => {
      return childNode.getclassname() === "Layout";
    });
  }
}

export default Container;
