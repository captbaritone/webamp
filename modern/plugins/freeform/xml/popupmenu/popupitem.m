#include <lib/std.mi>

#define MARGIN 2
#define MARGIN_PRE  2
#define MARGIN_POST 6

#define CHECKMARK_WIDTH 10
#define ARROW_WIDTH 10

Function setArrow(int want);
Function setCheckmark(int want);
Function updatePos();

Global Group mgrp;
Global GuiObject background;
Class GuiObject ItemSwitcher;
Global int id;
Global int want_checkmark;
Global int want_arrow;

Global ItemSwitcher a, b, c, d;
Global GuiObject _a, _b, _c;

System.onScriptLoaded() {
  mgrp = getScriptGroup();
  if (mgrp == NULL) {
    messagebox("popupitem.maki: cannot run outside a group", "Error", 0, "");
    return;
  }

  _a = mgrp.getObject("popup.item.checkmark"); a = _a;
  _b = mgrp.getObject("popup.item.text"); b = _b;
  _c = mgrp.getObject("popup.item.submenuarrow"); c = _c;
  background = mgrp.getObject("popup.background"); d = background;

  want_checkmark = -1;
  want_arrow = -1;
}

mgrp.onNotify(String command, String param, int a, int b) {
  if (command == "id") id = StringToInteger(param);
  if (command == "arrow") setArrow(StringToInteger(param));
  if (command == "checkmark") setCheckMark(StringToInteger(param));
}

ItemSwitcher.onEnterArea() {
  background.cancelTarget();
  background.setAlpha(255);
}

ItemSwitcher.onLeaveArea() {
  background.setTargetA(0);
  background.setTargetSpeed(0.25);
  background.gotoTarget();
}

ItemSwitcher.onLeftButtonDown(int x, int y) {
  mgrp.endModal(id);
}

setArrow(int want) {
  if (want_arrow == want) return;
  want_arrow = want;
  updatePos();
}

setCheckmark(int want) {
  if (want_checkmark == want) return;
  want_checkmark = want;
  updatePos();
}

updatePos() {

  int x = MARGIN;
  int mx = MARGIN;

  if (!want_checkmark) {
   if (_a != NULL) {
     _a.hide();
    }
  } else {
   if (_a != NULL) {
     _a.show();
    }
    x += CHECKMARK_WIDTH + MARGIN_PRE;
    mx += CHECKMARK_WIDTH + MARGIN_PRE;
  }


  if (!want_arrow) {
   if (_c != NULL) {
      _c.hide();
    }
  } else {
   if (_c != NULL) {
      _c.show();
    }
    mx += ARROW_WIDTH + MARGIN_POST;
  }

  mx += MARGIN;

  if (_b != NULL) {
    _b.setXmlParam("x", IntegerToString(x));
    _b.setXmlParam("w", "-" + IntegerToString(mx));
  }

}

