import { getClass } from "../maki/objects";
import Button from "./Button";
import SystemObject from "./SystemObject";
import Container from "./Container";
import Layout from "./Layout";
import Layer from "./Layer";
import AnimatedLayer from "./AnimatedLayer";
import PopupMenu from "./PopupMenu";
import ToggleButton from "./ToggleButton";
import Status from "./Status";
import Text from "./Text";
import Group from "./Group";
import MakiMap from "./MakiMap";
import Timer from "./Timer";
import Slider from "./Slider";
import Vis from "./Vis";
import GuiObj from "./GuiObj";

// TODO: We could write a test using the data in object.ts which confirms that
// this is complete.
export function classResolver(guid: string): any {
  switch (guid) {
    case "4ee3e1994becc636bc78cd97b028869c":
      return GuiObj;
    case "ce4f97be4e1977b098d45699276cc933":
      return Vis;
    case "62b65e3f408d375e8176ea8d771bb94a":
      return Slider;
    case "6b64cd274c4b5a26a7e6598c3a49f60c":
      return AnimatedLayer;
    case "5d0c5bb64b1f7de1168d0fa741199459":
      return Timer;
    case "3860366542a7461b3fd875aa73bf6766":
      return MakiMap;
    case "45be95e5419120725fbb5c93fd17f1f9":
      return Group;
    case "d6f50f6449b793fa66baf193983eaeef":
      return SystemObject;
    case "e90dc47b4ae7840d0b042cb0fcf775d2":
      return Container;
    case "60906d4e482e537e94cc04b072568861":
      return Layout;
    case "5ab9fa1545579a7d5765c8aba97cc6a6":
      return Layer;
    case "f4787af44ef7b2bb4be7fb9c8da8bea9":
      return PopupMenu;
    case "698eddcd4fec8f1e44f9129b45ff09f9":
      return Button;
    case "b4dccfff4bcc81fe0f721b96ff0fbed5":
      return ToggleButton;
    case "efaa867241fa310ea985dcb74bcb5b52":
      return Text;
    case "0f08c9404b23af39c4b8f38059bb7e8f":
      return Status;
    default:
      throw new Error(
        `Unresolvable class "${getClass(guid).name}" (guid: ${guid})`
      );
  }
}
