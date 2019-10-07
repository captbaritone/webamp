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
  _scriptGroup: Group;
  _root: MakiObject;
  _store: ModernStore;
  _privateInt: Map<string, Map<string, number>>;
  _privateString: Map<string, Map<string, string>>;
  constructor(scriptGroup: Group | null, store: ModernStore) {
    super(null, null);
    this._store = store;

    this._scriptGroup = scriptGroup == null ? new Group() : scriptGroup;
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

  getruntimeversion() {
    return "5.666";
  }

  // Retreive a token from a list of tokens seperated by separator.
  gettoken(str: string, separator: string, tokennum: number): string {
    const tokens = str.split(separator);
    if (tokens.length > tokennum) {
      return tokens[tokennum];
    }
    return "";
  }

  getparam() {
    unimplementedWarning("getparam");
    return "Some String";
  }

  getskinname() {
    unimplementedWarning("getskinname");
    return "Some String";
  }

  getplayitemstring() {
    unimplementedWarning("getplayitemstring");
    return "Some String";
  }

  geteq() {
    unimplementedWarning("geteq");
    return 0;
  }

  oneqchanged(newstatus: number): void {
    this.js_trigger("onEqChanged", newstatus);
  }

  geteqband(band: number) {
    unimplementedWarning("geteqband");
    return 0;
  }

  geteqpreamp() {
    unimplementedWarning("geteqpreamp");
    return 0;
  }

  getstatus() {
    unimplementedWarning("getstatus");
    return 0;
  }

  messagebox(
    message: string,
    msgtitle: string,
    flag: number,
    notanymoreId: string
  ) {
    console.log({ message, msgtitle, flag, notanymoreId });
  }

  integertostring(value: number) {
    return value.toString();
  }

  stringtointeger(str: string) {
    return parseInt(str, 10);
  }

  getprivateint(section: string, item: string, defvalue: number): number {
    if (!this._privateInt.has(section)) {
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
  getvolume() {
    return Selectors.getVolume(this._store.getState());
  }

  setvolume(volume: number): void {
    return this._store.dispatch(Actions.setVolume(volume));
  }

  getplayitemlength() {
    unimplementedWarning("getplayitemlength");
    return 100000;
  }

  seekto(pos: number) {
    unimplementedWarning("seekto");
  }

  getviewportheight() {
    return Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    );
  }

  getviewportwidth() {
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
    unimplementedWarning("newdynamiccontainer");
    return;
  }

  newgroup(group_id: string) {
    unimplementedWarning("newgroup");
    return;
  }

  newgroupaslayout(group_id: string) {
    unimplementedWarning("newgroupaslayout");
    return;
  }

  getnumcontainers() {
    unimplementedWarning("getnumcontainers");
    return;
  }

  enumcontainer(num: number) {
    unimplementedWarning("enumcontainer");
    return;
  }

  getwac(wac_guid: string) {
    unimplementedWarning("getwac");
    return;
  }

  getplayitemmetadatastring(metadataname: string) {
    unimplementedWarning("getplayitemmetadatastring");
    return;
  }

  getplayitemdisplaytitle() {
    unimplementedWarning("getplayitemdisplaytitle");
    return;
  }

  getextfamily(ext: string) {
    unimplementedWarning("getextfamily");
    return;
  }

  playfile(playitem: string) {
    unimplementedWarning("playfile");
    return;
  }

  play() {
    unimplementedWarning("play");
    return;
  }

  stop() {
    unimplementedWarning("stop");
    return;
  }

  pause() {
    unimplementedWarning("pause");
    return;
  }

  next() {
    unimplementedWarning("next");
    return;
  }

  previous() {
    unimplementedWarning("previous");
    return;
  }

  eject() {
    unimplementedWarning("eject");
    return;
  }

  getposition() {
    unimplementedWarning("getposition");
    return;
  }

  seteqband(band: number, value: number) {
    unimplementedWarning("seteqband");
    return;
  }

  seteqpreamp(value: number) {
    unimplementedWarning("seteqpreamp");
    return;
  }

  seteq(onoff: number) {
    unimplementedWarning("seteq");
    return;
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

  removepath(str: string) {
    unimplementedWarning("removepath");
  }

  getpath(str: string) {
    unimplementedWarning("getpath");
    return;
  }

  getextension(str: string) {
    unimplementedWarning("getextension");
    return;
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
    if (!this._privateString.has(section)) {
      return defvalue;
    }
    // @ts-ignore We know the section exists
    this._privateString.get(section).get(item);
  }

  setpublicstring(item: string, value: string) {
    unimplementedWarning("setpublicstring");
    return;
  }

  setpublicint(item: string, value: number) {
    unimplementedWarning("setpublicint");
    return;
  }

  getpublicstring(item: string, defvalue: string) {
    unimplementedWarning("getpublicstring");
    return;
  }

  getpublicint(item: string, defvalue: number) {
    unimplementedWarning("getpublicint");
    return;
  }

  getviewportwidthfrompoint(x: number, y: number) {
    unimplementedWarning("getviewportwidthfrompoint");
    return;
  }

  getviewportheightfrompoint(x: number, y: number) {
    unimplementedWarning("getviewportheightfrompoint");
    return;
  }

  getviewportleft() {
    unimplementedWarning("getviewportleft");
    return;
  }

  getviewportleftfrompoint(x: number, y: number) {
    unimplementedWarning("getviewportleftfrompoint");
    return;
  }

  getviewporttop() {
    unimplementedWarning("getviewporttop");
    return;
  }

  getviewporttopfrompoint(x: number, y: number) {
    unimplementedWarning("getviewporttopfrompoint");
    return;
  }

  debugstring(str: string, severity: number) {
    unimplementedWarning("debugstring");
    return;
  }

  ddesend(application: string, command: string, mininterval: number) {
    unimplementedWarning("ddesend");
    return;
  }

  onlookforcomponent(guid: string) {
    unimplementedWarning("onlookforcomponent");
    return;
  }

  getcurappleft() {
    unimplementedWarning("getcurappleft");
    return;
  }

  getcurapptop() {
    unimplementedWarning("getcurapptop");
    return;
  }

  getcurappwidth() {
    unimplementedWarning("getcurappwidth");
    return;
  }

  getcurappheight() {
    unimplementedWarning("getcurappheight");
    return;
  }

  isappactive() {
    unimplementedWarning("isappactive");
    return;
  }

  switchskin(skinname: string) {
    unimplementedWarning("switchskin");
    return;
  }

  isloadingskin() {
    unimplementedWarning("isloadingskin");
    return;
  }

  lockui() {
    unimplementedWarning("lockui");
    return;
  }

  unlockui() {
    unimplementedWarning("unlockui");
    return;
  }

  getmainbrowser() {
    unimplementedWarning("getmainbrowser");
    return;
  }

  popmainbrowser() {
    unimplementedWarning("popmainbrowser");
    return;
  }

  navigateurl(url: string) {
    unimplementedWarning("navigateurl");
    return;
  }

  isobjectvalid(o: MakiObject) {
    unimplementedWarning("isobjectvalid");
    return;
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

  setmenutransparency(alphavalue: number) {
    unimplementedWarning("setmenutransparency");
    return;
  }

  ongetcancelcomponent(guid: string, goingvisible: boolean): boolean {
    unimplementedWarning("ongetcancelcomponent");
    this.js_trigger("onGetCancelComponent", guid, goingvisible);
    // TODO: not sure what we shuld return
    return true;
  }

  iskeydown(vk_code: number) {
    unimplementedWarning("iskeydown");
    return;
  }

  setclipboardtext(_text: string) {
    unimplementedWarning("setclipboardtext");
    return;
  }

  chr(charnum: number): string {
    return String.fromCharCode(charnum);
  }

  selectfile(extlist: string, id: string, prev_filename: string) {
    unimplementedWarning("selectfile");
    return;
  }

  systemmenu() {
    unimplementedWarning("systemmenu");
    return;
  }

  windowmenu() {
    unimplementedWarning("windowmenu");
    return;
  }

  triggeraction(context: GuiObject, actionname: string, actionparam: string) {
    unimplementedWarning("triggeraction");
    return;
  }

  showwindow(
    guidorgroupid: string,
    preferedcontainer: string,
    transient: boolean
  ) {
    unimplementedWarning("showwindow");
    return;
  }

  hidewindow(hw: GuiObject) {
    unimplementedWarning("hidewindow");
    return;
  }

  hidenamedwindow(guidorgroup: string) {
    unimplementedWarning("hidenamedwindow");
    return;
  }

  isnamedwindowvisible(guidorgroup: string) {
    unimplementedWarning("isnamedwindowvisible");
    return;
  }

  setatom(atomname: string, object: MakiObject) {
    unimplementedWarning("setatom");
    return;
  }

  getatom(atomname: string) {
    unimplementedWarning("getatom");
    return;
  }

  invokedebugger() {
    unimplementedWarning("invokedebugger");
    return;
  }

  isvideo() {
    unimplementedWarning("isvideo");
    return;
  }

  isvideofullscreen() {
    unimplementedWarning("isvideofullscreen");
    return;
  }

  getidealvideowidth() {
    unimplementedWarning("getidealvideowidth");
    return;
  }

  getidealvideoheight() {
    unimplementedWarning("getidealvideoheight");
    return;
  }

  isminimized() {
    unimplementedWarning("isminimized");
    return;
  }

  minimizeapplication() {
    unimplementedWarning("minimizeapplication");
    return;
  }

  restoreapplication() {
    unimplementedWarning("restoreapplication");
    return;
  }

  activateapplication() {
    unimplementedWarning("activateapplication");
    return;
  }

  getplaylistlength() {
    unimplementedWarning("getplaylistlength");
    return;
  }

  getplaylistindex() {
    unimplementedWarning("getplaylistindex");
    return;
  }

  isdesktopalphaavailable() {
    unimplementedWarning("isdesktopalphaavailable");
    return;
  }

  istransparencyavailable() {
    unimplementedWarning("istransparencyavailable");
    return;
  }

  onshownotification(): number {
    this.js_trigger("onShowNotification");
    return 1; // return 1 if you implement it
  }

  getsonginfotext() {
    unimplementedWarning("getsonginfotext");
    return;
  }

  getvisband(channel: number, band: number) {
    unimplementedWarning("getvisband");
    return;
  }

  onviewportchanged(width: number, height: number) {
    unimplementedWarning("onviewportchanged");
    return;
  }

  onurlchange(url: string) {
    unimplementedWarning("onurlchange");
    return;
  }

  oneqfreqchanged(isiso: number) {
    unimplementedWarning("oneqfreqchanged");
    return;
  }

  enumembedguid(num: number) {
    unimplementedWarning("enumembedguid");
    return;
  }

  getmetadatastring(filename: string, metadataname: string) {
    unimplementedWarning("getmetadatastring");
    return;
  }

  getcurrenttrackrating() {
    unimplementedWarning("getcurrenttrackrating");
    return;
  }

  oncurrenttrackrated(rating: number) {
    unimplementedWarning("oncurrenttrackrated");
    return;
  }

  setcurrenttrackrating(rating: number) {
    unimplementedWarning("setcurrenttrackrating");
    return;
  }

  getdecodername(playitem: string) {
    unimplementedWarning("getdecodername");
    return;
  }

  getalbumart(playitem: string) {
    unimplementedWarning("getalbumart");
    return;
  }

  downloadmedia(
    url: string,
    destinationPath: string,
    wantAddToML: boolean,
    notifyDownloadsList: boolean
  ) {
    unimplementedWarning("downloadmedia");
    return;
  }

  downloadurl(
    url: string,
    destination_filename: string,
    progress_dialog_title: string
  ) {
    unimplementedWarning("downloadurl");
    return;
  }

  ondownloadfinished(url: string, success: boolean, filename: string) {
    unimplementedWarning("ondownloadfinished");
    return;
  }

  getdownloadpath() {
    unimplementedWarning("getdownloadpath");
    return;
  }

  setdownloadpath(new_path: string) {
    unimplementedWarning("setdownloadpath");
    return;
  }

  enqueuefile(playitem: string) {
    unimplementedWarning("enqueuefile");
    return;
  }

  urldecode(url: string) {
    unimplementedWarning("urldecode");
    return;
  }

  parseatf(topass: string) {
    unimplementedWarning("parseatf");
    return;
  }

  log10(value: number) {
    unimplementedWarning("log10");
    return;
  }

  ln(value: number) {
    unimplementedWarning("ln");
    return;
  }

  getviewportwidthfromguiobject(g) {
    unimplementedWarning("getviewportwidthfromguiobject");
    return;
  }

  getmonitorwidth() {
    unimplementedWarning("getmonitorwidth");
    return;
  }

  getmonitorwidthfrompoint(x: number, y: number) {
    unimplementedWarning("getmonitorwidthfrompoint");
    return;
  }

  getmonitorwidthfromguiobject(g) {
    unimplementedWarning("getmonitorwidthfromguiobject");
    return;
  }

  onmousemove(x: number, y: number) {
    unimplementedWarning("onmousemove");
    return;
  }

  getviewportheightfromguiobject(g) {
    unimplementedWarning("getviewportheightfromguiobject");
    return;
  }

  getmonitorheight() {
    unimplementedWarning("getmonitorheight");
    return;
  }

  getmonitorheightfrompoint(x: number, y: number) {
    unimplementedWarning("getmonitorheightfrompoint");
    return;
  }

  getmonitorheightfromguiobject(g) {
    unimplementedWarning("getmonitorheightfromguiobject");
    return;
  }

  getmonitorleft() {
    unimplementedWarning("getmonitorleft");
    return;
  }

  getmonitorleftfromguiobject(g) {
    unimplementedWarning("getmonitorleftfromguiobject");
    return;
  }

  getmonitorleftfrompoint(x: number, y: number) {
    unimplementedWarning("getmonitorleftfrompoint");
    return;
  }

  getmonitortop() {
    unimplementedWarning("getmonitortop");
    return;
  }

  getmonitortopfromguiobject(g) {
    unimplementedWarning("getmonitortopfromguiobject");
    return;
  }

  getmonitortopfrompoint(x: number, y: number) {
    unimplementedWarning("getmonitortopfrompoint");
    return;
  }

  getviewportleftfromguiobject(g) {
    unimplementedWarning("getviewportleftfromguiobject");
    return;
  }

  getviewporttopfromguiobject(g) {
    unimplementedWarning("getviewporttopfromguiobject");
    return;
  }

  navigateurlbrowser(url: string) {
    unimplementedWarning("navigateurlbrowser");
    return;
  }

  onopenurl(url: string) {
    unimplementedWarning("onopenurl");
    return;
  }

  translate(str: string) {
    unimplementedWarning("translate");
    return;
  }

  getstring(table: string, id: number) {
    unimplementedWarning("getstring");
    return;
  }

  getlanguageid() {
    unimplementedWarning("getlanguageid");
    return;
  }

  selectfolder(wnd_title: string, wnd_info: string, default_path: string) {
    unimplementedWarning("selectfolder");
    return;
  }

  hasvideosupport() {
    unimplementedWarning("hasvideosupport");
    return;
  }

  clearplaylist() {
    unimplementedWarning("clearplaylist");
    return;
  }

  getsonginfotexttranslated() {
    unimplementedWarning("getsonginfotexttranslated");
    return;
  }

  iswa2componentvisible(guid: string) {
    unimplementedWarning("iswa2componentvisible");
    return;
  }

  hidewa2component(guid: string) {
    unimplementedWarning("hidewa2component");
    return;
  }

  isproversion() {
    unimplementedWarning("isproversion");
    return;
  }

  getwinampversion() {
    unimplementedWarning("getwinampversion");
    return;
  }

  getbuildnumber() {
    unimplementedWarning("getbuildnumber");
    return;
  }

  getfilesize(fullfilename: string) {
    unimplementedWarning("getfilesize");
    return;
  }
}

export default System;
