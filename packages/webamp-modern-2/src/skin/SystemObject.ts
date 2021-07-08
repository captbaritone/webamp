import { getClass } from "../maki/objects";
import { ParsedMaki } from "../maki/parser";
import BaseObject from "./BaseObject";
import Container from "./Container";
import { clamp, integerToTime } from "../utils";
import Group from "./Group";
import PRIVATE_CONFIG from "./PrivateConfig";
import UI_ROOT from "../UIRoot";

const MOUSE_POS = { x: 0, y: 0 };

// TODO: Figure out how this could be unsubscribed eventually
document.addEventListener("mousemove", (e: MouseEvent) => {
  MOUSE_POS.x = e.clientX;
  MOUSE_POS.y = e.clientY;
});

export default class SystemObject extends BaseObject {
  _parentGroup: Group;
  _parsedScript: ParsedMaki;

  constructor(parsedScript: ParsedMaki) {
    super();
    this._parsedScript = parsedScript;
  }

  init() {
    // dumpScriptDebug(this._parsedScript);
    const initialVariable = this._parsedScript.variables[0];
    if (initialVariable.type !== "OBJECT") {
      throw new Error("First variable was not SystemObject.");
    }
    initialVariable.value = this;

    UI_ROOT.vm.addScript(this._parsedScript);
    UI_ROOT.vm.dispatch(this, "onscriptloaded");
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
    for (const container of UI_ROOT.getContainers()) {
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
    return UI_ROOT.audio.getVolume() * 255;
  }

  /**
   * Set the volume to the desired value.
   * Range is from 0 to 255.
   *
   *  @param vol  The desired volume value.
   */
  setvolume(_vol: number) {
    const vol = clamp(_vol, 0, 255);

    UI_ROOT.audio.setVolume(vol / 255);
  }

  /**
  * play()
  * 
  * Trigger the play event.
  */
  play() {

  }

  /**
  * stop()
  * 
  * Trigger the stop event.
  */
  stop() {
    
  }

  /**
  * pause()
  * 
  * Trigger the pause event.
  */
  pause() {
    
  }

  /**
  * next()
  * 
  * Trigger the next event.
  */
  next() {
    
  }

  /**
  * previous()
  * 
  * Trigger the previous event.
  */
  previous() {
    
  }

  /**
  * eject()
  * 
  * Trigger the eject event.
  */
  eject() {
    
  }

/**
  * messageBox()
  * 
  * Creates a message box.
  * The flag paramater lets you set the style of the message box.
  * Just use the OR bitwise operator to set the style you want.
  * Here's a list of the flags you can use:
  * 
  * MSGBOX_OK         Adds an OK button.      (1)
  * MSGBOX_CANCEL     Adds a CANCEL button.   (2)
  * MSGBOX_YES        Adds a YES button.      (4)
  * MSGBOX_NO         Adds a NO button.       (8)
  * MSGBOX_ALL        Adds ALL buttons.       (16)
  * MSGBOX_NEXT       Adds a NEXT button.     (32)
  * MSGBOX_PREVIOUS   Adds a PREVIOUS button. (64)
  * 
  * Note that the notanymore_id parameter stores the users answer in the 
  * configuration file with the entry name specified by it's value.
  * 
  * @ret   The value of the button that was pressed (example: if OK is pressed, 1 is returned).
  * @param    message         The message you want to display.
  * @param    msgtitle        The title of the message box.
  * @param    flag            The message box style you want.
  * @param    notanymore_id   Configuration item name in which to store the users answer.
  */
  messagebox(message: string, msgtitle: string, flag: number, notanymore_id: string) {
    // TODO
  }

  /**
  * getPlayItemString()
  *
  * @ret The name of what is playing.
  */
  getplayitemstring(): string {
    return "Niente da Caprie";
  }

  /**
  * getPlayItemMetaDataString()
  * 
  * Get metadata for the track currently playing. Make sure to wrap metadataname in double quotes -> ". 
  * The metadata field names that are available are the following:
  * 
  * title
  * album
  * artist
  * albumartist
  * comment
  * year
  * composer
  * bitrate
  * srate
  * stereo
  * vbr
  * replaygain_track_gain
  * replaygain_album_gain
  * replaygain_track_peak
  * replaygain_album_peak
  * gain
  * genre
  * track
  * length
  * disc
  * bpm
  * conductor
  * key
  * mood
  * subtitle
  * lyricist
  * ISRC
  * media
  * remixer
  * encoder
  * publisher
  * tool
  * pregap
  * postgap
  * numsamples
  * 
  * 
  * @ret                 The requested metadata.
  * @param  metadataname    The name of the metadata field you want to read.
  */
  getplayitemmetadatastring(metadataname: string): string {
    return "Metadata"; // TODO 
  }


  /**
  * Requires 5.53
  * @ret                 The requested metadata.
  * @param  metadataname    The name of the metadata field you want to read.
  */
  getmetadatastring(filename: string, metadataname: string): string {
    return "Metadatastring"; // TODO
  }

  /**
  * TODO
  */
  getplayitemdisplaytitle(): string {
    return "playitemdisplaytitle"; //What does this really do?
  }

  /**
   * Requires 5.5
   * TODO
   */
  getcurrenttrackrating() {

  }
  /**
   * Requires 5.5
   * TODO
   * @param rating 
   */
  oncurrenttrackrated(rating: number) {
    
  }
  
  /**
   * Requires 5.5
   * TODO
   * @param rating 
   */
  setcurrenttrackrating(rating: number) {
    
  }

  /**
  * getExtFamily()
  * 
  * This one still return the same as getDecoderName()
  * 
  * Gets registered family for given extension (i.e. mp3 -> "Audio")
  * 
  * @ret The registered family for given extension.
  * @param ext The extension in question.
  */
  getextfamily(ext: string): string {
    return "Audio";
  }

  /**
   * 
   * @param playitem 
   * @returns Above as getExtFamily(), needs more investigating
   */
  getdecodername(playitem: string): string {
    return "Nullsoft MPEG Decoder v4.103";
  }

  /**
  * Requires 5.54
  * downloadMedia()
  * 
  * Hookable. Downloads a file from url and saves it as destination_filename.
  * If destinationPath is "" it will be saved in CD Ripping dir (=getDownloadPath()).
  * 
  * @param  url  the file to be downloaded
  * @param  destinationPath  the path you want to store the file
  * @param  wantAddToML  set true if you wnt to add the file to ML database
  * @param  notifyDownloadsList  set true in order to list the download in <DownloadsLis/> Object
  */
  downloadmedia(url: string, destinationPath: string, wantAddToML: boolean, notifyDownloadsList: boolean) {
    // TODO
  }

  /**
   * Deprecated, destination_filename is just a dummy parameter as well as progress_dialog_title - use download() instead
   * Requires 5.5
   * @param url 
   * @param destination_filename 
   * @param progress_dialog_title 
   */
  downloadurl(url: string, destination_filename: string, progress_dialog_title: string) {

  } 

  /**
   * Requires 5.53
   * @param url 
   * @param success 
   * @param filename 
   */
  ondownloadfinished(url: string, success: boolean, filename: string) {
    // TODO
  }

  /**
   * Requires 5.53
   * @param string returns the CD Ripping Directory
   */
  getdownloadpath(): string {
    return "C:\\CD Rips";
  }
  /**
   * Requires 5.53
   * @param new_path Sets the CD Ripping Directory
   */
  setdownloadpath(new_path: string) {
    // TODO
  }

  /**
  * Requires 5.5
  * enqueueFile()
  * 
  * Enqueque the requested file. Path and filename are required
  * with proper extension (example: playFile("c:\music\mp3\file.mp3"); ).
  * It also works with URL's (example: playFile("http://myshoutcast.com:8000"); ).
  * 
  * @param  playitem  The path and filename to play.
  */
  enqueuefile(playitem: string) {
    // TODO
  } 

  /**
  * playFile()
  * 
  * Play the requested file. Path and filename are required
  * with proper extension (example: playFile("c:\music\mp3\file.mp3"); ).
  * It also works with URL's (example: playFile("http://myshoutcast.com:8000"); ).
  * 
  * @param  playitem  The path and filename to play.
  */
  playfile(playitem: string) {
    // TODO
  }

  /**
   * Requires 5.51
   * @param fullfilename 
   */
  getfilesize(fullfilename: string): number {
    return 100;
  } 

  /**
   * Requires 5.5
   * @param playitem 
   * @returns Will return 1 if an album art has been downloaded, otherwise 0 
   */
  getalbumart(playitem: string): number {
    return 1;
  } 

  /**
   * Get the length of the track currently playing, in milliseconds.
   *
   * @ret Length of the track, in seconds.
   */
  getplayitemlength(): number {
    return UI_ROOT.audio.getLength();
    //
  }

  /**
   * Seek to the desired position in the track. Range is from
   * 0 to SONG LENGTH (in milliseconds).
   */
  seekto(pos: number) {
    // Note: For some reason I seem to be getting passed seconds here not MS
    UI_ROOT.audio.seekTo(pos);
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
    return integerToTime(value);
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
  * getExtension()
  * 
  * Gets the extension from a filename. (example:
  * c:\music\mp3\test.mp3 -> mp3)
  * Also works on URLs.
  *
  * @ret    The extension of the filename.
  * @param str The fullpath of a file.
  */
  getextension(str: string): string {
    return "mp3";
  }

  /**
  * removePath()
  * 
  * Remove the path from a full filename. (example:
  * c:\music\mp3\test.mp3 -> test.mp3)
  * Also works on URLs.
  * 
  * @ret    The filename with the path removed.
  * @param str The fullpath of a file.
  */
  removepath(str: string): string {
    return "test.mp3";
  }

  /**
  * getPath()
  * 
  * Gets the path from a full filename. (example:
  * c:\music\mp3\test.mp3 -> c:\music\mp3)
  * Also works on URLs.
  * 
  * @ret    The path with the filename removed.
  * @param str The fullpath of a file.
  */
  getpath(str: string): string {
    return "c:\\music\\mp3";
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
  * getEqPreamp()
  *
  * Get the equalizer preamp value. The value range is
  * from -127 to +127 (0 means no preamp).
  *
  * @ret The preamp's current value.
  */
  geteqpreamp(): number {
    return 0;
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
  * setEqPreamp()
  *
  * Set the equalizer pre-amp to the desired value.
  * Range is from -127 to +127 (0 means no preamp).
  *
  * @param  value The desired value for the pre-amp.
  */
  seteqpreamp(value: number) {
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
   * @param channel 0: Mono, 1: Left, 2: Right, does not work in Winamp3 or Winamp5
   * @param band Returns the selected band of the Spectrum Analyzer
   * @ret ranges from 0 to 255
   */
  getvisband(channel: number, band: number): number {
    return 0;
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
