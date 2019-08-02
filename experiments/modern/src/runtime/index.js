const System = require("./System");
const Button = require("./Button");
const ToggleButton = require("./ToggleButton");
const Group = require("./Group");
const Layout = require('./Layout');
const Layer = require('./Layer');
const PopupMenu = require('./PopupMenu');
const List = require('./List');
const Status = require('./Status');
const Text = require('./Text');
const Container = require('./Container');
const GuiObject = require("./GuiObject");
const MakiObject = require("./MakiObject");

const runtime = {
  "516549714a510d87b5a6e391e7f33532": MakiObject,
  d6f50f6449b793fa66baf193983eaeef: System,
  "45be95e5419120725fbb5c93fd17f1f9": Group,
  "4ee3e1994becc636bc78cd97b028869c": GuiObject,
  "698eddcd4fec8f1e44f9129b45ff09f9": Button,
  b4dccfff4bcc81fe0f721b96ff0fbed5: ToggleButton,
  f4787af44ef7b2bb4be7fb9c8da8bea9: PopupMenu,
  e90dc47b4ae7840d0b042cb0fcf775d2: Container,
  "60906d4e482e537e94cc04b072568861": Layout,
  b2023ab54ba1434d6359aebec6f30375: List,
  "5ab9fa1545579a7d5765c8aba97cc6a6": Layer,
  "0f08c9404b23af39c4b8f38059bb7e8f": Status,
  efaa867241fa310ea985dcb74bcb5b52: Text,
};

module.exports = runtime;
