import { interpret } from "../maki/interpreter";
import { getClass } from "../maki/objects";
import { ParsedMaki } from "../maki/parser";
import { SkinContext } from "../types";
import Button from "./Button";
import Container from "./Container";

import Group from "./Group";
import Layer from "./Layer";
import Layout from "./Layout";
import PopupMenu from "./PopupMenu";
import Status from "./Status";
import Text from "./Text";
import ToggleButton from "./ToggleButton";

export default class SystemObject {
  _parentGroup: Group;
  _parsedScript: ParsedMaki;
  _context: SkinContext;

  constructor(parsedScript: ParsedMaki) {
    this._parsedScript = parsedScript;
  }

  init(context: SkinContext) {
    this._context = context;
    // dumpScriptDebug(this._parsedScript);
    const initialVariable = this._parsedScript.variables[0];
    if (initialVariable.type !== "OBJECT") {
      throw new Error("First variable was not SystemObject.");
    }
    initialVariable.value = this;
    // TODO: How should we setup bindings?
    // console.log(this._parsedScript.bindings);
    interpret(0, this._parsedScript, classResover);

    interpret(
      this._parsedScript.bindings[0].commandOffset,
      this._parsedScript,
      classResover
    );
  }

  setParentGroup(group: Group) {
    this._parentGroup = group;
  }

  /* Required for Maki */
  getruntimeversion(): number {
    return 5.666;
  }

  getskinname() {
    return "TODO: Get the Real skin name";
  }

  /**
   * Read a private config entry of Integer type. Returns
   * the specified default value if the section and item isn't
   * found.
   *
   * @ret           The value of the config entry.
   * @param  section   The section from which to read the entry.
   * @param  item      The name of the item to read.
   * @param  defvalue  The defautl value to return if no item is found.
   */
  getprivateint(section: string, item: string, defvalue: number) {
    // TODO: Implement this!
    // FIXME
    return defvalue;
  }

  /**
   * Create a private config entry for your script, of Int type.
   *
   * @param  section   The section for the entry.
   * @param  item      The item name for the entry.
   * @param  value     The value of the entry.
   */
  setprivateint(section: string, item: string, value: number) {
    // FIXME
  }

  /**
   * Read the current time of the day. Returns a number that's
   * the number of milliseconds since the start of the day (0:00).
   *
   * @ret The number of milliseconds since midnight.
   **/
  gettimeofday(): number {
    const date = new Date();
    const dateTime = date.getTime();
    const dateCopy = new Date(dateTime);
    return dateTime - dateCopy.setHours(0, 0, 0, 0);
  }

  /**
   * @ret                 The requested container.
   * @param  container_id    The containers identifier string.
   **/
  getcontainer(containerId: string): Container {
    const lower = containerId.toLowerCase();
    for (const container of this._context.containers) {
      if (container.getId() === lower) {
        return container;
      }
    }
    throw new Error(`Could not find a container with the id; "${containerId}"`);
  }

  /**
   * Get the value of the left vu meter.
   * Range is from 0 to 255. Linear.
   *
   * @ret The value of the left vu meter.
   */
  getleftvumeter(): number {
    return 0;
  }

  /**
   * Get the value of the right vu meter.
   * Range is from 0 to 255. Linear.
   *
   * @ret The value of the right vu meter.
   */
  getrightvumeter(): number {
    return 0;
  }

  /**
   * Get the current volume. Range is from 0 to 255.
   *
   * @ret The current volume.
   **/
  getvolume() {
    return 100;
  }

  /**
   * Get the string representation of an integer.
   *
   * @ret         The string equivalent of the integer.
   * @param  value   The integer to change into a string.
   */
  integertostring(value: number): string {
    return String(value);
  }

  /**
   * Get the user's screen width in pixels.
   *
   * @ret The width of the user's screen.
   */
  getviewportwidth() {
    return window.document.documentElement.clientWidth;
  }

  /**
   * Get the user's screen height in pixels.
   *
   * @ret The height of the user's screen.
   */
  getviewportheight() {
    return window.document.documentElement.clientHeight;
  }
}

function classResover(guid: string): any {
  switch (guid) {
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

function dumpScriptDebug(script: ParsedMaki) {
  for (const [i, binding] of script.bindings.entries()) {
    const method = script.methods[binding.methodOffset];
    const guid = script.classes[method.typeOffset];
    const klass = getClass(guid);
    console.log(
      `${i}. ${klass.name}.${method.name} => ${binding.commandOffset}`
    );
  }
}
