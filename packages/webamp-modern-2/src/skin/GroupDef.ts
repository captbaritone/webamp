import * as Utils from "../utils";
import GuiObj from "./GuiObj";

// NOTE: This object is not represented in Maki, it's purely an XML constructa.
// http://wiki.winamp.com/wiki/XML_Containing_objects#.3Cgroupdef.3E.3C.2Fgroupdef.3E
export default class GroupDef extends GuiObj {
  _background: string;
  _desktopAlpha: boolean;
  _drawBackground: boolean;
  _minimumHeight: number;
  _maximumHeight: number;
  _minimumWidth: number;
  _maximumWidth: number;
  _children: GuiObj[] = [];

  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "background":
        // (str) The id of a bitmap element to be stretched as the background of the group (all of the group contents draw on top of this bitmap)
        this._background = value;
        break;
      case "drawbackground":
        // (bool) Whether or not to actually draw the background pixels (useful for using the alpha channel of a background bitmap as the drawing region for the group).
        this._drawBackground = Utils.toBool(value);
        break;
      case "minimum_h":
        // (int) The minimum height for this group, beyond which Wasabi will not allow the group to be resized.
        this._minimumHeight = Utils.num(value);
        break;
      case "minimum_w":
        // (int) The maximum width for this group, beyond which Wasabi will not allow the group to be resized.
        this._minimumWidth = Utils.num(value);
        break;
      case "maximum_h":
        // (int) The maximum height for this group, beyond which Wasabi will not allow the group to be resized.
        this._maximumHeight = Utils.num(value);
        break;
      case "maximum_w":
        // (int) The minimum width for this group, beyond which Wasabi will not allow the group to be resized.
        this._maximumWidth = Utils.num(value);
        break;
      /* 
default_w - (int) The default width for this group, if the group instantiation does not specify what the width should be.
default_h - (int) The default height for this group, if the group instantiation does not specify what the height should be.
propagatesize - (bool) Sends this group's default/minimum/maximum size parameters to the layout which contains the group. ie: if my minimum_h is 200 and my containing layout's minimum_h is 100 and I have my propagatesize flag set, my layout will now have a * minimum_h of 200, etc.
lockminmax - (bool) Locks the minimum and maximum size values to the default size value. Makes the group "nonresizable."
design_w - (int) The "design width" of this group. The "design" based sizes allow for a conditional layout of GuiObjects within them. These parameters are used in conjunction with the x1/x2/y1/y2/anchor coordinate system, which will be documented with GuiObjects.
design_h - (int) The "design height" of this group.
name - (str) A human readable string which will be the "Name" of this group, used by various objects in the system when referring the user to this groupdef. For instance, the TabSheet GuiObject contains one group for each displayed tab, and the name parameter of each group is the string displayed within each corresponding tab.
autowidthsource - (str) The id of an object contained within this group from which this group should set its width. For instance, the groupdef that defines the contents of the Checkbox GuiObject sets its width based on the size of the text object within it, which itself will be sized at instantiation depending upon the text placed within that particular text object (See: $/studio/studio/Wacs/wasabi.system/ui/guiobjects/xml/checkbox/checkbox.xml).
autoheightsource - (str) The id of an object contained within the group from which this group should set its height.
register_autopopup - (bool) This flag causes this group to be listed in the Windows submenu of the Wasabi MainMenu context menu. Its name parameter is displayed as the menu item. If that menu item is then selected, this group will be launched as a layout (in other words, in its own window). This is quite useful for the quick debugging of groupdef objects.
windowtype - (str) Specifying a groupdef as being a certain windowtype causes the group to automatically be instantiated and added to the collection specified by that windowtype. See below for more information and a list of what windowtypes currently exist in the system.
inherit_content - (bool) This parameter is used to be able to override the contents of a group already defined in the system. To go back to the "blueprints" analogy, this is like finding someone's original blueprints and editing them. The id of this groupdef should match the id of the other groupdef that you wish to modify. See below for examples and more information.
inherit_group - (str) This parameter is used to be able to copy the contents of a group already defined in the system as the starting point for one's own group definition. To go back to the "blueprints" analogy, this is like photocopying someone else's blueprints as a starting point for one's own. The param is the id of the other groupdef you wish to inherit.
inherit_params - (bool) Specifies whether or not to inherit the params of the inherited group as well as its content. Only meaningful with a valid inherit_group param or if overriding a previous groupdef.
xuitag - (str) Specifies that this group definition will create a new Xui object into the system with the given tag string. See Extending Wasabi: Creating XuiObjects for more information.
embed_xui - (str) Specifies the id of a contained object to which any XML parameters not valid for a group sent to the instantiation of the group (or the xuitag string) should be forwarded. See Extending Wasabi: Creating XuiObjects for more information.
*/
      default:
        return false;
    }
    return true;
  }

  addChild(child: GuiObj) {
    this._children.push(child);
  }
}
