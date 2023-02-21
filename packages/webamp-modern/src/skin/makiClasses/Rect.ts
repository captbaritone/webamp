import GuiObj from "./GuiObj";
import { px } from "../../utils";
import { UIRoot } from "../../UIRoot";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Crect.2F.3E
export default class Rect extends GuiObj {
  static GUID = "OFFICIALLY-NO-GUID";
  _color: string;
  _filled: string;
  _edges: string; //left | right | top | bottom
  _left: HTMLElement;
  _middle: HTMLElement;
  _right: HTMLElement;
}
