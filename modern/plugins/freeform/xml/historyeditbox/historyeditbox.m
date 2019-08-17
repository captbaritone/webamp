#include <lib/std.mi>

Global Button back, forward;
Global Edit editbox;
Global GuiObject xui;

System.onScriptLoaded() {
  Group pgroup = getScriptGroup();
  if (pgroup == NULL) return;

  back = pgroup.findObject("historyeditbox.back.button");
  forward = pgroup.findObject("historyeditbox.forward.button");
  editbox = pgroup.findObject("historyeditbox.edit");
  xui = pgroup.getParent();

  if (xui != NULL) {
   if (StringToInteger(xui.getXmlParam("navbuttons")) == 0) {
     if (back != NULL) back.hide();
     if (forward != NULL) forward.hide();
     if (editbox != NULL) editbox.setXmlParam("w", "-17");
   }
  }
}

back.onLeftClick() {
  if (xui != NULL)
    xui.sendAction("back", "", 0, 0, 0, 0);
}

forward.onLeftClick() {
  if (xui != NULL)
    xui.sendAction("forward", "", 0, 0, 0, 0);
}