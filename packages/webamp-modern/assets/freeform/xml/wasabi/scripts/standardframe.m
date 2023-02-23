#include <lib/std.mi>

Global Group frameGroup, content, titlebar;
Global String x, y, w, h, rx, ry, rw, rh;
Global Layer mouselayer;
Global Button Sysmenu;

Function setNewGroup(String groupid);

System.onScriptLoaded() {
  frameGroup = getScriptGroup();
  String param = getParam();
  x = getToken(param, ",", 0);
  y = getToken(param, ",", 1);
  w = getToken(param, ",", 2);
  h = getToken(param, ",", 3);
  rx = getToken(param, ",", 4);
  ry = getToken(param, ",", 5);
  rw = getToken(param, ",", 6);
  rh = getToken(param, ",", 7);
  sysmenu = frameGroup.findObject("sysmenu");
}

System.onSetXuiParam(String param, String value) {
  if (param == "content") {
    setNewGroup(value);
    titlebar = frameGroup.findObject("wasabi.titlebar");
    mouselayer = titlebar.findObject("mousetrap");
  }
  if (param == "padtitleright" || param == "padtitleleft") {
    if (titlebar != NULL) titlebar.setXmlParam(param, value); 
  }
  if (param == "shade") {
    if (mouselayer != NULL) mouselayer.setXmlParam("dblclickaction", "switch;"+value);
    else messagebox("Cannot set shade parameter for StandardFrame object, no mousetrap found", "Skin Error", 0, "");
  }
}

// backward compatibility for prerelease notify trick
frameGroup.onNotify(String cmd, String param, int a, int b) {
  String _command = getToken(cmd, ",", 0);
  String _param = getToken(cmd, ",", 1);
  if (_command == "content" || _command == "padtitleright" || _command == "padtitleleft" || _command == "shade") {
    onSetXuiParam(_command, _param);
  }
}

setNewGroup(String groupid) {
  content = newGroup(groupid);
  if (content == NULL) {
    messagebox("group \"" + groupid + "\" not found", "ButtonGroup", 0, "");
    return;
  }
  content.setXmlParam("x", x);
  content.setXmlParam("y", y);
  content.setXmlParam("w", w);
  content.setXmlParam("h", h);
  content.setXmlParam("relatx", rx);
  content.setXmlParam("relaty", ry);
  content.setXmlParam("relatw", rw);
  content.setXmlParam("relath", rh);
  content.init(frameGroup);
}

Sysmenu.onLeftClick() {
  LayoutStatus _status = frameGroup.findObject("sysmenu.status");
  _status.callme("{system}");
}
