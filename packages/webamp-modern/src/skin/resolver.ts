import { getClass } from "../maki/objects";
import BaseObject from "./makiClasses/BaseObject";
import Button from "./makiClasses/Button";
import SystemObject from "./makiClasses/SystemObject";
import Container from "./makiClasses/Container";
import Layout from "./makiClasses/Layout";
import Layer from "./makiClasses/Layer";
import AnimatedLayer from "./makiClasses/AnimatedLayer";
import PopupMenu from "./makiClasses/PopupMenu";
import ToggleButton from "./makiClasses/ToggleButton";
import LayoutStatus from "./makiClasses/LayoutStatus";
import Status from "./makiClasses/Status";
import Text from "./makiClasses/Text";
import Menu from "./makiClasses/Menu";
import Frame from "./makiClasses/Frame";
import Group from "./makiClasses/Group";
import MakiMap from "./makiClasses/MakiMap";
import MakiList from "./makiClasses/List";
import BitList from "./makiClasses/BitList";
import GroupList from "./makiClasses/GroupList";
import CfgGroup from "./makiClasses/CfgGroup";
import TabSheet from "./makiClasses/TabSheet";
import MouseRedir from "./makiClasses/MouseRedir";
import DropDownList from "./makiClasses/DropDownList";
import Edit from "./makiClasses/Edit";
import Browser from "./makiClasses/Browser";
import Wac from "./makiClasses/Wac";
import QueryList from "./makiClasses/QueryList";
import GuiList from "./makiClasses/GuiList";
import GuiTree from "./makiClasses/GuiTree";
import TreeItem from "./makiClasses/TreeItem";
import CheckBox from "./makiClasses/CheckBox";
import Timer from "./makiClasses/Timer";
import Slider from "./makiClasses/Slider";
import Vis from "./makiClasses/Vis";
import EqVis from "./makiClasses/EqVis";
import GuiObj from "./makiClasses/GuiObj";
import Config from "./makiClasses/Config";
import ConfigItem from "./makiClasses/ConfigItem";
import ConfigAttribute from "./makiClasses/ConfigAttribute";
import WinampConfig, { WinampConfigGroup } from "./makiClasses/WinampConfig";
import ComponentBucket from "./makiClasses/ComponentBucket";
import AlbumArt from "./makiClasses/AlbumArt";
import Region from "./makiClasses/Region";
import { PlEdit, PlDir } from "./makiClasses/PlayList";
import PlayListGui from "./makiClasses/PlayListGui";
import WasabiTitleBar from "./makiClasses/WasabiTitle";
import WindowHolder from "./makiClasses/WindowHolder";
import Application from "./makiClasses/Application";
import File from "./makiClasses/File";
import XmlDoc from "./makiClasses/XmlDoc";

const CLASSES = [
  BaseObject,
  Config,
  ConfigItem,
  ConfigAttribute,
  WinampConfig,
  WinampConfigGroup,
  ComponentBucket,
  Region,
  AlbumArt,
  Button,
  SystemObject,
  Container,
  Layout,
  Layer,
  AnimatedLayer,
  PopupMenu,
  ToggleButton,
  Status,
  LayoutStatus,
  Text,
  Menu,
  Frame,
  Group,
  MakiMap,
  MakiList,
  BitList,
  GroupList,
  CfgGroup,
  TabSheet,
  MouseRedir,
  DropDownList,
  Edit,
  Browser,
  Wac,
  QueryList,
  GuiList,
  GuiTree,
  TreeItem,
  CheckBox,
  Timer,
  Slider,
  Vis,
  EqVis,
  PlEdit,
  PlDir,
  PlayListGui,
  GuiObj,
  WasabiTitleBar,
  WindowHolder,
  Application,
  File,
  XmlDoc,
];

const GUID_MAP = {};
for (const klass of CLASSES) {
  if (klass.GUID == null) {
    throw new Error("Expected GUID on class.");
  }
  GUID_MAP[klass.GUID.toLowerCase()] = klass;
}

// TODO: We could write a test using the data in object.ts which confirms that
// this is complete.
export function classResolver(guid: string): any {
  const klass = GUID_MAP[guid];
  if (klass == null) {
    throw new Error(
      `Unresolvable class "${getClass(guid).name}" (guid: ${guid})`
    );
  }
  return klass;
}
