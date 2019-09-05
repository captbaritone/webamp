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
    this.parent.js_trigger("js_update");
  }

  hide(): void {
    this.visible = false;
    this.parent.js_trigger("js_update");
  }

  setxmlparam(param: string, value: string): void {
    this.attributes[param] = value;
    this.js_trigger("js_update");
  }

  getlayout(id: string) {
    return findDescendantByTypeAndId(this, "layout", id);
  }

  onswitchtolayout(newlayout) {
    unimplementedWarning("onswitchtolayout");
    return;
  }

  onbeforeswitchtolayout(oldlayout, newlayout) {
    unimplementedWarning("onbeforeswitchtolayout");
    return;
  }

  onhidelayout(_layout) {
    unimplementedWarning("onhidelayout");
    return;
  }

  onshowlayout(_layout) {
    unimplementedWarning("onshowlayout");
    return;
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
    return this.children.find(childNode => {
      return childNode.getclassname() === "Layout";
    });
  }
}

export default Container;
