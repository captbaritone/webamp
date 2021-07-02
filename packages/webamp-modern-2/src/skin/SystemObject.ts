import { getClass } from "../maki/objects";
import { ParsedMaki } from "../maki/parser";
import { V } from "../maki/v";
import { SkinContext } from "../types";
import AUDIO_PLAYER from "./AudioPlayer";
import BaseObject from "./BaseObject";
import Container from "./Container";
import { clamp } from "../utils";
import Group from "./Group";
import PRIVATE_CONFIG from "./PrivateConfig";
import { VM } from "./VM";

const MOUSE_POS = { x: 0, y: 0 };

// TODO: Figure out how this could be unsubscribed eventually
document.addEventListener("mousemove", (e: MouseEvent) => {
  MOUSE_POS.x = e.clientX;
  MOUSE_POS.y = e.clientY;
});

export default class SystemObject extends BaseObject {
  _parentGroup: Group;
  _parsedScript: ParsedMaki;
  _context: SkinContext;

  constructor(parsedScript: ParsedMaki) {
    super();
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

    VM.addScript(this._parsedScript);
    VM.dispatch(this, "onscriptloaded");
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
   * This returns the X position of the mouse in the screen,
   * using the screen coordinate system.
   *
   * @ret The mouse's current X pos.
   */
  getmouseposx(): number {
    return MOUSE_POS.x;
  }

  /**
   * This returns the Y position of the mouse in the screen,
   * using the screen coordinate system.
   *
   * @ret The mouse's current Y pos.
   */
  getmouseposy(): number {
    return MOUSE_POS.y;
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
    return PRIVATE_CONFIG.getPrivateInt(section, item, defvalue);
  }

  /**
   * Create a private config entry for your script, of Int type.
   *
   * @param  section   The section for the entry.
   * @param  item      The item name for the entry.
   * @param  value     The value of the entry.
   */
  setprivateint(section: string, item: string, value: number) {
    PRIVATE_CONFIG.setPrivateInt(section, item, value);
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
    return AUDIO_PLAYER.getVolume() * 255;
  }

  /**
   * Set the volume to the desired value.
   * Range is from 0 to 255.
   *
   *  @param vol  The desired volume value.
   */
  setvolume(_vol: number) {
    const vol = clamp(_vol, 0, 255);

    AUDIO_PLAYER.setVolume(vol / 255);
  }

  /**
   * Get the length of the track currently playing, in milliseconds.
   *
   * @ret Length of the track, in seconds.
   */
  getplayitemlength(): number {
    return AUDIO_PLAYER.getLength();
    //
  }

  /**
   * Seek to the desired position in the track. Range is from
   * 0 to SONG LENGTH (in milliseconds).
   */
  seekto(pos: number) {
    // Note: For some reason I seem to be getting passed seconds here not MS
    AUDIO_PLAYER.seekTo(pos);
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
   * Convert a time in seconds to a M:SS value, does not
   * return MM:SS as originally stated.
   * 
   * @ret       The string representation of the time (M:SS).
   * @param  value Timestamp to use.
   */
  integertotime(value: number): string {
    // TODO
    return "0:00";
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
  getPosition()

  Get the current position in the track currently playing,
  in milliseconds.

  @ret The current position in the track.
  */
  getposition() {
    return "25000";
  }

  /**
  getStatus()

  returns the status of the main player core.

  @ret STATUS_PAUSED (-1) if paused, STATUS_STOPPED (0) if stopped, STATUS_PLAYING (1) if playing.
  */
  getstatus() {
    return 1;
  }

  /**
   * Get the user's screen height in pixels.
   *
   * @ret The height of the user's screen.
   */
  getviewportheight() {
    return window.document.documentElement.clientHeight;
  }

  getviewporttop() {
    // TODO: What should this really be?
    return 0;
  }

  getviewportleft() {
    // TODO: What should this really be?
    return 0;
  }

  /**
   * Get the applications current left coordinate in the screen,
   * using the screen coordinate system.
   *
   * @ret The left coordinate of the application.
   */
  getcurappleft(): number {
    return 0;
  }

  /**
   * Get the applications current top coordinate in the screen,
   * using the screen coordinate system.
   *
   * @ret The top coordinate of the application.
   */
  getcurapptop(): number {
    return 0;
  }

  /**
   * getCurAppWidth()
   *
   * Get the applications current window width, in pixels.
   *
   * @ret The width of the application window.
   */
  getcurappwidth(): number {
    // TODO
    return 1000;
  }

  /**
   * Get the applications current window height, in pixels.
   *
   * @ret The height of the application window.
   */
  getcurappheight(): number {
    // TODO
    return 1000;
  }

  /**
   * Get the value of an equalizer band. The bands
   * are numbered from 0 (60Hz) to 9 (16kHz). The return
   * value range is from -127 to +127.
   *
   * @ret       The value of the band.
   * @param  band  The eq band number you want to get.
   */
  geteqband(band: number) {
    return 100;
  }

  /**
   * Get the equalizer state. 0 for off, 1 for on.
   * Remember to compare return value to true and false.
   *
   *  @ret The EQ's state.
   */
  geteq(): number {
    return 1;
  }

  /**
   * Set the equalizer to the desired state. On or off.
   * 0 is off, 1 is on.
   *
   * @param  onoff The desired state for the eq.
   */
  seteq(onoff: number) {
    // TODO
  }

  /**
   * Sets the requested equalizer band to the specified value.
   * The bands are numbered from 0 (60Hz) to 9 (16kHz) and
   * each range from -127 to +127.
   *
   * @param  band  The EQ band to set.
   * @param  value The desired value for the specified band.
   */
  seteqband(band: number, value: number) {
    // TODO
  }

  /**
   * Takes an angle in radians and returns the ratio between two sides of a right triangle.
   * The ratio is sin(x) divided by cos(x).
   *
   * @ret       The tangent value of the angle.
   * @param  value The angle for which you want to know the tangent value.
   */
  tan(value: number): number {
    return Math.tan(value);
  }

  /**
   * Takes an angle in radians and returns the ratio of two sides of a right triangle.
   * The ratio is the length of the side opposite the angle divided by the length
   * of the hypotenuse. The result range is from -1 to 1.
   *
   * Converting from degrees to radians can be done by multiplying degrees by PI/180.
   *
   * @ret       The sine value of the angle.
   * @param  value The angle for which you want to know the sine value.
   */
  sin(value: number): number {
    return Math.sin(value);
  }

  /**
   * Takes an angle in radians and returns the ratio of the two sides of a right triangle.
   * The ratio is the length of the side adjacent to the angle divided by the length of the
   * hypotenuse. The result is range is from -1 to 1.
   *
   * @ret       The cosine value of the angle.
   * @param  value The angle for which you want to know the cosine value.
   */
  cos(value: number): number {
    return Math.cos(value);
  }

  /**
   * Takes a sine value ranging from -1 to 1 and returns the angle in radians.
   * The return value ranges from -PI/2 to +PI/2.
   *
   *  @ret       The angle in radians.
   * @param  value The sine value for which you want to know the angle.
   */
  asin(value: number): number {
    return Math.asin(value);
  }

  /**
   * Takes a cosine value ranging from -1 to 1 and returns the angle in radians.
   * The return value ranges from -PI/2 to +PI/2.
   *
   * @ret       The angle in radians.
   * @param  value The cosine value for which you want to know the angle.
   */
  acos(value: number): number {
    return Math.acos(value);
  }

  /**
   * Takes an angle in radians and returns the ration between two sides of a right triangle.
   * The ratio is cos(x) divided by sin(x).
   *
   * @ret     The arc tangent value of the angle.
   */
  atan(value: number): number {
    return Math.atan(value);
  }

  /**
   * @ret The arctangent of y/x.
   */
  atan2(y: number, x: number): number {
    return Math.atan2(y, x);
  }

  /**
   * Elevate a number to the N'th power.
   *
   * @ret         The number
   * @param  value   The number you want to elevate to the N power.
   * @param  pvalue  The power to which you want to elevate the number.
   */
  pow(value: number, pvalue: number): number {
    return Math.pow(value, pvalue);
  }

  /**
   * Get the square of a number.
   *
   * @ret       The number, squared.
   * @param  value The number for which you want the square value.
   */
  sqr(value: number): number {
    return value * value;
  }

  log10(value: number) {
    return Math.log10(value);
  }
  ln(value: number): number {
    throw new Error("Unimplemented");
  }

  /**
   * Get the square root of a number.
   *
   * @ret       The square root of the number.
   * @param  value The number for which you want the square root value.
   */
  sqrt(value: number): number {
    return Math.sqrt(value);
  }

  /**
   * Get a randomely generated number. The random number will not
   * be bigger than the max value indicated. Smallest value is 0.
   *
   * @ret     The random number.
   * @param  max The maximum value of the random number to return.
   */
  random(max: number) {
    // TODO: Should this return an int?
    return Math.random() * max;
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
