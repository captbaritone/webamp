import GuiObj from "./GuiObj";
import { px } from "../../utils";
import { UIRoot } from "../../UIRoot";

/**
 * The snappoint is an invisible point that will attract other snappoint objects with
 * the same id in any other layout and make them want to dock, like little magnets.
 * These objects have only the following subset of guiobject XML parameters:
 */
// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Csnappoint.2F.3E
export default class SnapPoint extends GuiObj {
  static GUID = "OFFICIALLY-NO-GUID";
  _color: string;
  _filled: string;
  _edges: string; //left | right | top | bottom
}
