const System = require("./System");
const Group = require("./Group");
const GuiObject = require("./GuiObject");

class PopupMenu {}
class Container {}

const runtime = {
  d6f50f6449b793fa66baf193983eaeef: System,
  "45be95e5419120725fbb5c93fd17f1f9": Group,
  "4ee3e1994becc636bc78cd97b028869c": GuiObject,
  f4787af44ef7b2bb4be7fb9c8da8bea9: PopupMenu,
  e90dc47b4ae7840d0b042cb0fcf775d2: Container
};

module.exports = runtime;
