#include <lib/std.mi>


Global Group pg;

System.onScriptLoaded() {
  pg = getScriptGroup();
}

pg.onSetVisible(int v) {
  GuiObject t = pg.findObject("wasabi.menubutton.text");
  if (t != NULL) {
    if (v) {
      t.setXmlParam("offsetx", "1");
      t.setXmlParam("offsety", "1");
    } else {
      t.setXmlParam("offsetx", "0");
      t.setXmlParam("offsety", "0");
    }
  }
}
