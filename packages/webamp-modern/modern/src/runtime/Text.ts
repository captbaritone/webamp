import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class Text extends GuiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Text";
  }

  setalternatetext(txt: string): void {
    unimplementedWarning("setalternatetext");
  }

  settext(txt: string): void {
    return unimplementedWarning("settext");
  }

  gettext(): string {
    unimplementedWarning("gettext");
    return "";
  }

  gettextwidth(): number {
    return unimplementedWarning("gettextwidth");
  }

  ontextchanged(newtxt: string): void {
    this.js_trigger("onTextChanged", newtxt);
  }
}

export default Text;
