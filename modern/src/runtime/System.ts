import Group from "./Group";
import MakiObject from "./MakiObject";
import {
  findDescendantByTypeAndId,
  getMousePosition,
  unimplementedWarning,
} from "../utils";
import * as Actions from "../Actions";
import * as Selectors from "../Selectors";
import { ModernStore } from "../types";
import Layout from "./Layout";
import GuiObject from "./GuiObject";

class System extends MakiObject {
  _scriptGroup: MakiObject;
  _root: MakiObject;
  _store: ModernStore;
  _privateInt: Map<string, Map<string, number>>;
  _privateString: Map<string, Map<string, string>>;
  constructor(scriptGroup: MakiObject | null, store: ModernStore) {
    super(null, null);
    this._store = store;

    this._scriptGroup =
      scriptGroup == null ? new Group(null, null) : scriptGroup;
    this._root = this._scriptGroup;
    while (this._root.parent) {
      this._root = this._root.parent;
    }
    // TODO: Replace these with a DefaultMap once we have one.
    this._privateInt = new Map();
    this._privateString = new Map();
  }

  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "System";
  }

  getscriptgroup() {
    return this._scriptGroup;
  }

  getcontainer(id: string) {
    return findDescendantByTypeAndId(this._root, "container", id);
  }

  getruntimeversion(): number {
    return 5.666;
  }

  // Retreive a token from a list of tokens seperated by separator.
  gettoken(str: string, separator: string, tokennum: number): string {
    const tokens = str.split(separator);
    if (tokens.length > tokennum) {
      return tokens[tokennum];
    }
    return "";
  }

  getparam(): string {
    unimplementedWarning("getparam");
    return "Some String";
  }

  getskinname(): string {
    unimplementedWarning("getskinname");
    return "Some String";
  }

  getplayitemstring(): string {
    unimplementedWarning("getplayitemstring");
    return "Some String";
  }

  geteq(): number {
    unimplementedWarning("geteq");
    return 0;
  }

  oneqchanged(newstatus: number): void {
    this.js_trigger("onEqChanged", newstatus);
  }

  geteqband(band: number): number {
    unimplementedWarning("geteqband");
    return 0;
  }

  geteqpreamp(): number {
    unimplementedWarning("geteqpreamp");
    return 0;
  }

  getstatus(): number {
    unimplementedWarning("getstatus");
    return 0;
  }

  messagebox(
    message: string,
    msgtitle: string,
    flag: number,
    notanymoreId: string
  ): number {
    console.log({ message, msgtitle, flag, notanymoreId });
    return unimplementedWarning("getstatus");
  }

  integertostring(value: number): string {
    return value.toString();
  }

  stringtointeger(str: string): number {
    return parseInt(str, 10);
  }

  getprivateint(section: string, item: string, defvalue: number): number {
    if (
      !this._privateInt.has(section) ||
      // @ts-ignore We know this section exists
      !this._privateInt.get(section).has(item)
    ) {
      return defvalue;
    }
    // @ts-ignore We know this section exists
    return this._privateInt.get(section).get(item);
  }

  // I think `defvalue` here is a typo that we inherited from std.mi. It should just be `value`.
  setprivateint(section: string, item: string, defvalue: number): void {
    if (!this._privateInt.has(section)) {
      this._privateInt.set(section, new Map([[item, defvalue]]));
    } else {
      // @ts-ignore We know the section exists
      this._privateInt.get(section).set(item, defvalue);
    }
  }

  getleftvumeter(): number {
    return Selectors.getLeftVUMeter(this._store.getState());
  }

  getrightvumeter(): number {
    return Selectors.getRightVUMeter(this._store.getState());
  }

  // Seems like volume is 0-255
  getvolume(): number {
    return Selectors.getVolume(this._store.getState());
  }

  setvolume(volume: number): void {
    return this._store.dispatch(Actions.setVolume(volume));
  }

  getplayitemlength(): number {
    unimplementedWarning("getplayitemlength");
    return 100000;
  }

  seekto(pos: number): void {
    unimplementedWarning("seekto");
  }

  getviewportheight(): number {
    return Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    );
  }

  getviewportwidth(): number {
    return Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
  }

  onscriptloaded(): void {
    this.js_trigger("onScriptLoaded");
  }

  onscriptunloading(): void {
    this.js_trigger("onScriptUnloading");
  }

  onquit(): void {
    this.js_trigger("onQuit");
  }

  onsetxuiparam(param: string, value: string): void {
    this.js_trigger("onSetXuiParam", param, value);
  }

  onkeydown(key: string): void {
    this.js_trigger("onKeyDown", key);
  }

  onaccelerator(action: string, section: string, key: string): void {
    this.js_trigger("onAccelerator", action, section, key);
  }

  oncreatelayout(_layout: Layout): void {
    this.js_trigger("onCreateLayout", _layout);
  }

  onshowlayout(_layout: Layout): void {
    this.js_trigger("onShowLayout", _layout);
  }

  onhidelayout(_layout: Layout): void {
    this.js_trigger("onHideLayout", _layout);
  }

  onstop(): void {
    this.js_trigger("onStop");
  }

  onplay(): void {
    this.js_trigger("onPlay");
  }

  onpause(): void {
    this.js_trigger("onPause");
  }

  onresume(): void {
    this.js_trigger("onResume");
  }

  ontitlechange(newtitle: string): void {
    this.js_trigger("onTitleChange", newtitle);
  }

  ontitle2change(newtitle2: string): void {
    this.js_trigger("onTitle2Change", newtitle2);
  }

  oninfochange(info: string): void {
    this.js_trigger("onInfoChange", info);
  }

  onstatusmsg(msg: string): void {
    this.js_trigger("onStatusMsg", msg);
  }

  oneqbandchanged(band: number, newvalue: number): void {
    this.js_trigger("onEqBandChanged", band, newvalue);
  }

  oneqpreampchanged(newvalue: number): void {
    this.js_trigger("onEqPreampChanged", newvalue);
  }

  onvolumechanged(newvol: number): void {
    this.js_trigger("onVolumeChanged", newvol);
  }

  onseek(newpos: number): void {
    this.js_trigger("onSeek", newpos);
  }

  newdynamiccontainer(container_id: string) {
    return unimplementedWarning("newdynamiccontainer");
  }

  newgroup(group_id: string) {
    return unimplementedWarning("newgroup");
  }

  newgroupaslayout(group_id: string) {
    return unimplementedWarning("newgroupaslayout");
  }

  getnumcontainers(): number {
    return unimplementedWarning("getnumcontainers");
  }

  enumcontainer(num: number) {
    return unimplementedWarning("enumcontainer");
  }

  getwac(wac_guid: string) {
    return unimplementedWarning("getwac");
  }

  getplayitemmetadatastring(metadataname: string): string {
    return unimplementedWarning("getplayitemmetadatastring");
  }

  getplayitemdisplaytitle(): string {
    return unimplementedWarning("getplayitemdisplaytitle");
  }

  getextfamily(ext: string): string {
    return unimplementedWarning("getextfamily");
  }

  playfile(playitem: string): void {
    return unimplementedWarning("playfile");
  }

  play(): void {
    return unimplementedWarning("play");
  }

  stop(): void {
    return unimplementedWarning("stop");
  }

  pause(): void {
    return unimplementedWarning("pause");
  }

  next(): void {
    return unimplementedWarning("next");
  }

  previous(): void {
    return unimplementedWarning("previous");
  }

  eject(): void {
    return unimplementedWarning("eject");
  }

  getposition(): number {
    return unimplementedWarning("getposition");
  }

  seteqband(band: number, value: number): void {
    return unimplementedWarning("seteqband");
  }

  seteqpreamp(value: number): void {
    return unimplementedWarning("seteqpreamp");
  }

  seteq(onoff: number): void {
    return unimplementedWarning("seteq");
  }

  getmouseposx(): number {
    return getMousePosition().x;
  }

  getmouseposy(): number {
    return getMousePosition().y;
  }

  floattostring(value: number, ndigits: number): string {
    return value.toFixed(ndigits).toString();
  }

  stringtofloat(str: string): number {
    return parseFloat(str);
  }

  _atLeastTwoDigits(n: number): string {
    return n > 9 ? n.toString() : `0${n}`;
  }

  // Convert a time in seconds to a HH:MM:SS value.
  integertolongtime(value: number): string {
    const hours = Math.floor(value / 3600);
    const remainingTime = value - hours * 3600;
    const minutes = Math.floor(remainingTime / 60);
    const seconds = Math.floor(remainingTime - minutes * 60);
    return `${this._atLeastTwoDigits(hours)}:${this._atLeastTwoDigits(
      minutes
    )}:${this._atLeastTwoDigits(seconds)}`;
  }

  // Convert a time in seconds to a MM:SS value.
  integertotime(value: number): string {
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value - minutes * 60);
    return `${this._atLeastTwoDigits(minutes)}:${this._atLeastTwoDigits(
      seconds
    )}`;
  }

  _getDateTimeInMs(date: Date): number {
    const dateTime = date.getTime();
    const dateCopy = new Date(dateTime);
    return dateTime - dateCopy.setHours(0, 0, 0, 0);
  }

  // datetime in HH:MM format (docs imply it is in the same format as integertotime
  // which would be MM:SS, but I tested in winamp and it is HH:MM)
  // (e.g. 17:44)
  datetotime(datetime: number): string {
    const date = new Date(datetime * 1000);
    const seconds = this._getDateTimeInMs(date) / 1000;
    const longtime = this.integertolongtime(seconds);
    return longtime.substring(0, longtime.length - 3);
  }

  // datetime in HH:MM:SS format
  // (e.g. 17:44:58)
  datetolongtime(datetime: number): string {
    const date = new Date(datetime * 1000);
    const seconds = this._getDateTimeInMs(date) / 1000;
    return this.integertolongtime(seconds);
  }

  // datetime in MM/DD/YY HH:MM:SS format
  // (e.g. 09/08/19 17:44:58)
  formatdate(datetime: number): string {
    const date = new Date(datetime * 1000);
    const seconds = this._getDateTimeInMs(date) / 1000;
    const dateString = date.toLocaleDateString("en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
    const timeString = this.integertolongtime(seconds);
    return `${dateString} ${timeString}`;
  }

  // datetime in DayOfWeek, Month DD, YYYY HH:MM:SS format
  // (e.g. Sunday, September 08, 2019 17:44:58)
  formatlongdate(datetime: number): string {
    const date = new Date(datetime * 1000);
    const seconds = this._getDateTimeInMs(date) / 1000;
    const dateString = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
    const timeString = this.integertolongtime(seconds);
    return `${dateString} ${timeString}`;
  }

  // returns the datetime's year since 1900
  getdateyear(datetime: number): number {
    const date = new Date(datetime * 1000);
    return date.getFullYear() - 1900;
  }

  // returns the datetime's month (0-11)
  getdatemonth(datetime: number): number {
    const date = new Date(datetime * 1000);
    return date.getMonth();
  }

  // returns the datetime's day of the month (1-31)
  getdateday(datetime: number): number {
    const date = new Date(datetime * 1000);
    return date.getDate();
  }

  // returns the datetime's day of the week (0-6)
  // MAKI starts with Sunday like JS
  getdatedow(datetime: number): number {
    const date = new Date(datetime * 1000);
    return date.getDay();
  }

  // returns the datetime's day of the year (0-365)
  getdatedoy(datetime: number): number {
    const date = new Date(datetime * 1000);
    const start = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date.getTime() - start.getTime()) / 86400000);
  }

  // returns the datetime's hour (0-23)
  getdatehour(datetime: number): number {
    const date = new Date(datetime * 1000);
    return date.getHours();
  }

  // returns the datetime's minutes (0-59)
  getdatemin(datetime: number): number {
    const date = new Date(datetime * 1000);
    return date.getMinutes();
  }

  // returns the datetime's seconds (0-59)
  getdatesec(datetime: number): number {
    const date = new Date(datetime * 1000);
    return date.getSeconds();
  }

  // Based on https://stackoverflow.com/questions/11887934/how-to-check-if-the-dst-daylight-saving-time-is-in-effect-and-if-it-is-whats
  _stdTimezoneOffset(date: Date): number {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  }

  // returns the datetime's daylight savings flag
  getdatedst(datetime: number): number {
    const date = new Date(datetime * 1000);
    return date.getTimezoneOffset() < this._stdTimezoneOffset(date) ? 1 : 0;
  }

  // returns the datetime in seconds, use with the above functions
  getdate(): number {
    return Math.floor(Date.now() / 1000);
  }

  // Get a substring from a string.
  strmid(str: string, start: number, len: number): string {
    return str.substring(start, start + len);
  }

  // Get a substring from a string, starting from the left.
  strleft(str: string, nchars: number): string {
    return str.substring(0, nchars);
  }

  // Get a substring from a string, starting from the right. Since
  // the start point is the right of the string (or the end). It will
  // extract the string starting from the END going towards the BEGINNING.
  strright(str: string, nchars: number): string {
    return str.substring(str.length - nchars);
  }

  // Search a string for any occurance of substring. If the substring was
  // found in the string, it will return the position of the substring in
  // the string searched. If the substring is not found, the return value
  // is -1.
  strsearch(str: string, substr: string): number {
    return str.indexOf(substr);
  }

  strlen(str: string): number {
    return str.length;
  }

  strupper(str: string): string {
    return str.toUpperCase();
  }

  strlower(str: string): string {
    return str.toLowerCase();
  }

  urlencode(url: string): string {
    return encodeURI(url);
  }

  removepath(str: string): string {
    return unimplementedWarning("removepath");
  }

  getpath(str: string): string {
    return unimplementedWarning("getpath");
  }

  getextension(str: string): string {
    return unimplementedWarning("getextension");
  }

  sin(value: number): number {
    return Math.sin(value);
  }

  cos(value: number): number {
    return Math.cos(value);
  }

  tan(value: number): number {
    return Math.tan(value);
  }

  asin(value: number): number {
    return Math.asin(value);
  }

  acos(value: number): number {
    return Math.acos(value);
  }

  atan(value: number): number {
    return Math.atan(value);
  }

  atan2(y: number, x: number): number {
    return Math.atan2(y, x);
  }

  pow(value: number, pvalue: number): number {
    return Math.pow(value, pvalue);
  }

  sqr(value: number): number {
    return Math.pow(value, 2);
  }

  sqrt(value: number): number {
    return Math.sqrt(value);
  }

  random(max: number): number {
    return Math.floor(Math.random() * max);
  }

  setprivatestring(section: string, item: string, value: string): void {
    if (!this._privateString.has(section)) {
      this._privateString.set(section, new Map([[item, value]]));
    } else {
      // @ts-ignore We know the section exists
      this._privateString.get(section).set(item, value);
    }
  }

  getprivatestring(section: string, item: string, defvalue: string): string {
    if (
      !this._privateString.has(section) ||
      // @ts-ignore We know this section exists
      !this._privateString.get(section).has(item)
    ) {
      return defvalue;
    }
    // @ts-ignore We know the section exists
    return this._privateString.get(section).get(item);
  }

  setpublicstring(item: string, value: string): void {
    return unimplementedWarning("setpublicstring");
  }

  setpublicint(item: string, value: number): void {
    return unimplementedWarning("setpublicint");
  }

  getpublicstring(item: string, defvalue: string): string {
    return unimplementedWarning("getpublicstring");
  }

  getpublicint(item: string, defvalue: number): number {
    return unimplementedWarning("getpublicint");
  }

  getviewportwidthfrompoint(x: number, y: number): number {
    return unimplementedWarning("getviewportwidthfrompoint");
  }

  getviewportheightfrompoint(x: number, y: number): number {
    return unimplementedWarning("getviewportheightfrompoint");
  }

  getviewportleft(): number {
    return unimplementedWarning("getviewportleft");
  }

  getviewportleftfrompoint(x: number, y: number): number {
    return unimplementedWarning("getviewportleftfrompoint");
  }

  getviewporttop(): number {
    return unimplementedWarning("getviewporttop");
  }

  getviewporttopfrompoint(x: number, y: number): number {
    return unimplementedWarning("getviewporttopfrompoint");
  }

  debugstring(str: string, severity: number): void {
    return unimplementedWarning("debugstring");
  }

  ddesend(application: string, command: string, mininterval: number): void {
    return unimplementedWarning("ddesend");
  }

  onlookforcomponent(guid: string) {
    return unimplementedWarning("onlookforcomponent");
  }

  getcurappleft(): number {
    return unimplementedWarning("getcurappleft");
  }

  getcurapptop(): number {
    return unimplementedWarning("getcurapptop");
  }

  getcurappwidth(): number {
    return unimplementedWarning("getcurappwidth");
  }

  getcurappheight(): number {
    return unimplementedWarning("getcurappheight");
  }

  isappactive(): boolean {
    return unimplementedWarning("isappactive");
  }

  switchskin(skinname: string): void {
    return unimplementedWarning("switchskin");
  }

  isloadingskin(): number {
    return unimplementedWarning("isloadingskin");
  }

  lockui(): void {
    return unimplementedWarning("lockui");
  }

  unlockui(): void {
    return unimplementedWarning("unlockui");
  }

  getmainbrowser() {
    return unimplementedWarning("getmainbrowser");
  }

  popmainbrowser(): void {
    return unimplementedWarning("popmainbrowser");
  }

  navigateurl(url: string): void {
    return unimplementedWarning("navigateurl");
  }

  isobjectvalid(o: MakiObject): boolean {
    return unimplementedWarning("isobjectvalid");
  }

  // Takes a Double and returns the closest integer representation.
  integer(d: number): number {
    return Math.round(d);
  }

  frac(d: number): number {
    return d - Math.floor(d);
  }

  // Returns ms since midnight
  gettimeofday(): number {
    const date = new Date();
    return this._getDateTimeInMs(date);
  }

  setmenutransparency(alphavalue: number): void {
    return unimplementedWarning("setmenutransparency");
  }

  ongetcancelcomponent(guid: string, goingvisible: boolean): boolean {
    unimplementedWarning("ongetcancelcomponent");
    this.js_trigger("onGetCancelComponent", guid, goingvisible);
    // TODO: not sure what we shuld return
    return true;
  }

  iskeydown(vk_code: number): number {
    return unimplementedWarning("iskeydown");
  }

  setclipboardtext(_text: string): void {
    return unimplementedWarning("setclipboardtext");
  }

  chr(charnum: number): string {
    return String.fromCharCode(charnum);
  }

  selectfile(extlist: string, id: string, prev_filename: string): string {
    return unimplementedWarning("selectfile");
  }

  systemmenu(): void {
    return unimplementedWarning("systemmenu");
  }

  windowmenu(): void {
    return unimplementedWarning("windowmenu");
  }

  triggeraction(
    context: GuiObject,
    actionname: string,
    actionparam: string
  ): void {
    return unimplementedWarning("triggeraction");
  }

  showwindow(
    guidorgroupid: string,
    preferedcontainer: string,
    transient: boolean
  ) {
    return unimplementedWarning("showwindow");
  }

  hidewindow(hw: GuiObject): void {
    return unimplementedWarning("hidewindow");
  }

  hidenamedwindow(guidorgroup: string): void {
    return unimplementedWarning("hidenamedwindow");
  }

  isnamedwindowvisible(guidorgroup: string): boolean {
    return unimplementedWarning("isnamedwindowvisible");
  }

  setatom(atomname: string, object: MakiObject): void {
    return unimplementedWarning("setatom");
  }

  getatom(atomname: string) {
    return unimplementedWarning("getatom");
  }

  invokedebugger(): void {
    return unimplementedWarning("invokedebugger");
  }

  isvideo(): number {
    return unimplementedWarning("isvideo");
  }

  isvideofullscreen(): number {
    return unimplementedWarning("isvideofullscreen");
  }

  getidealvideowidth(): number {
    return unimplementedWarning("getidealvideowidth");
  }

  getidealvideoheight(): number {
    return unimplementedWarning("getidealvideoheight");
  }

  isminimized(): number {
    return unimplementedWarning("isminimized");
  }

  minimizeapplication(): void {
    return unimplementedWarning("minimizeapplication");
  }

  restoreapplication(): void {
    return unimplementedWarning("restoreapplication");
  }

  activateapplication(): void {
    return unimplementedWarning("activateapplication");
  }

  getplaylistlength(): number {
    return unimplementedWarning("getplaylistlength");
  }

  getplaylistindex(): number {
    return unimplementedWarning("getplaylistindex");
  }

  isdesktopalphaavailable(): boolean {
    return unimplementedWarning("isdesktopalphaavailable");
  }

  istransparencyavailable(): boolean {
    return unimplementedWarning("istransparencyavailable");
  }

  onshownotification(): number {
    this.js_trigger("onShowNotification");
    return 1; // return 1 if you implement it
  }

  getsonginfotext(): string {
    return unimplementedWarning("getsonginfotext");
  }

  getvisband(channel: number, band: number): number {
    return unimplementedWarning("getvisband");
  }

  onviewportchanged(width: number, height: number): void {
    return unimplementedWarning("onviewportchanged");
  }

  onurlchange(url: string): void {
    return unimplementedWarning("onurlchange");
  }

  oneqfreqchanged(isiso: number): void {
    return unimplementedWarning("oneqfreqchanged");
  }

  enumembedguid(num: number): string {
    return unimplementedWarning("enumembedguid");
  }

  getmetadatastring(filename: string, metadataname: string): string {
    return unimplementedWarning("getmetadatastring");
  }

  getcurrenttrackrating(): number {
    return unimplementedWarning("getcurrenttrackrating");
  }

  oncurrenttrackrated(rating: number): void {
    return unimplementedWarning("oncurrenttrackrated");
  }

  setcurrenttrackrating(rating: number): void {
    return unimplementedWarning("setcurrenttrackrating");
  }

  getdecodername(playitem: string): string {
    return unimplementedWarning("getdecodername");
  }

  getalbumart(playitem: string): number {
    return unimplementedWarning("getalbumart");
  }

  downloadmedia(
    url: string,
    destinationPath: string,
    wantAddToML: boolean,
    notifyDownloadsList: boolean
  ): void {
    return unimplementedWarning("downloadmedia");
  }

  downloadurl(
    url: string,
    destination_filename: string,
    progress_dialog_title: string
  ): void {
    return unimplementedWarning("downloadurl");
  }

  ondownloadfinished(url: string, success: boolean, filename: string): void {
    return unimplementedWarning("ondownloadfinished");
  }

  getdownloadpath(): string {
    return unimplementedWarning("getdownloadpath");
  }

  setdownloadpath(new_path: string): void {
    return unimplementedWarning("setdownloadpath");
  }

  enqueuefile(playitem: string): void {
    return unimplementedWarning("enqueuefile");
  }

  urldecode(url: string): string {
    return unimplementedWarning("urldecode");
  }

  parseatf(topass: string): string {
    return unimplementedWarning("parseatf");
  }

  log10(value: number): number {
    return unimplementedWarning("log10");
  }

  ln(value: number): number {
    return unimplementedWarning("ln");
  }

  getviewportwidthfromguiobject(g: GuiObject): number {
    return unimplementedWarning("getviewportwidthfromguiobject");
  }

  getmonitorwidth(): number {
    return unimplementedWarning("getmonitorwidth");
  }

  getmonitorwidthfrompoint(x: number, y: number): number {
    return unimplementedWarning("getmonitorwidthfrompoint");
  }

  getmonitorwidthfromguiobject(g: GuiObject): number {
    return unimplementedWarning("getmonitorwidthfromguiobject");
  }

  onmousemove(x: number, y: number): void {
    return unimplementedWarning("onmousemove");
  }

  getviewportheightfromguiobject(g: GuiObject): number {
    return unimplementedWarning("getviewportheightfromguiobject");
  }

  getmonitorheight(): number {
    return unimplementedWarning("getmonitorheight");
  }

  getmonitorheightfrompoint(x: number, y: number): number {
    return unimplementedWarning("getmonitorheightfrompoint");
  }

  getmonitorheightfromguiobject(g: GuiObject): number {
    return unimplementedWarning("getmonitorheightfromguiobject");
  }

  getmonitorleft(): number {
    return unimplementedWarning("getmonitorleft");
  }

  getmonitorleftfromguiobject(g: GuiObject): number {
    return unimplementedWarning("getmonitorleftfromguiobject");
  }

  getmonitorleftfrompoint(x: number, y: number): number {
    return unimplementedWarning("getmonitorleftfrompoint");
  }

  getmonitortop(): number {
    return unimplementedWarning("getmonitortop");
  }

  getmonitortopfromguiobject(g: GuiObject): number {
    return unimplementedWarning("getmonitortopfromguiobject");
  }

  getmonitortopfrompoint(x: number, y: number): number {
    return unimplementedWarning("getmonitortopfrompoint");
  }

  getviewportleftfromguiobject(g: GuiObject): number {
    return unimplementedWarning("getviewportleftfromguiobject");
  }

  getviewporttopfromguiobject(g: GuiObject): number {
    return unimplementedWarning("getviewporttopfromguiobject");
  }

  navigateurlbrowser(url: string): void {
    return unimplementedWarning("navigateurlbrowser");
  }

  onopenurl(url: string): boolean {
    return unimplementedWarning("onopenurl");
  }

  translate(str: string): string {
    return unimplementedWarning("translate");
  }

  getstring(table: string, id: number): string {
    return unimplementedWarning("getstring");
  }

  getlanguageid(): string {
    return unimplementedWarning("getlanguageid");
  }

  selectfolder(
    wnd_title: string,
    wnd_info: string,
    default_path: string
  ): string {
    return unimplementedWarning("selectfolder");
  }

  hasvideosupport(): number {
    return unimplementedWarning("hasvideosupport");
  }

  clearplaylist(): void {
    return unimplementedWarning("clearplaylist");
  }

  getsonginfotexttranslated(): string {
    return unimplementedWarning("getsonginfotexttranslated");
  }

  iswa2componentvisible(guid: string): number {
    return unimplementedWarning("iswa2componentvisible");
  }

  hidewa2component(guid: string): void {
    return unimplementedWarning("hidewa2component");
  }

  isproversion(): boolean {
    return unimplementedWarning("isproversion");
  }

  getwinampversion(): string {
    return unimplementedWarning("getwinampversion");
  }

  getbuildnumber(): number {
    return unimplementedWarning("getbuildnumber");
  }

  getfilesize(fullfilename: string): number {
    return unimplementedWarning("getfilesize");
  }
}

export default System;
