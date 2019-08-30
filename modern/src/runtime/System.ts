import Group from "./Group";
import MakiObject from "./MakiObject";
import { findDescendantByTypeAndId, unimplementedWarning } from "../utils";
import * as Actions from "../Actions";
import * as Selectors from "../Selectors";

class System extends MakiObject {
  scriptGroup: Group;
  root: MakiObject;
  constructor(scriptGroup, store) {
    super(null, null, {}, store);

    this.scriptGroup = scriptGroup == null ? new Group() : scriptGroup;
    this.root = scriptGroup;
    while (this.root.parent) {
      this.root = this.root.parent;
    }
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

  js_start() {
    this.js_trigger("onScriptLoaded");
  }

  getscriptgroup() {
    return this.scriptGroup;
  }

  getcontainer(id: string) {
    return findDescendantByTypeAndId(this.root, "container", id);
  }

  getruntimeversion() {
    return "5.666";
  }

  gettoken(str: string, separator: string, tokennum: number) {
    unimplementedWarning("gettoken");
    return "Some Token String";
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

  oneqchanged(newstatus: number) {
    unimplementedWarning("newstatus");
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

  getprivateint(section: string, item: string, defvalue: number) {
    unimplementedWarning("getprivateint");
    return defvalue;
  }

  setprivateint(section: string, item: string, defvalue: number) {
    unimplementedWarning("setprivateint");
  }

  getleftvumeter() {
    unimplementedWarning("getleftvumeter");
    return 0.5;
  }

  getrightvumeter() {
    unimplementedWarning("getrightvumeter");
    return 0.5;
  }

  // Seems like volume is 0-255
  getvolume() {
    return Selectors.getVolume(this._store.getState());
  }

  setvolume(volume: number) {
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

  onscriptloaded() {
    unimplementedWarning("onscriptloaded");
    return;
  }

  onscriptunloading() {
    unimplementedWarning("onscriptunloading");
    return;
  }

  onquit() {
    unimplementedWarning("onquit");
    return;
  }

  onsetxuiparam(param: string, value: string) {
    unimplementedWarning("onsetxuiparam");
    return;
  }

  onkeydown(key: string) {
    unimplementedWarning("onkeydown");
    return;
  }

  onaccelerator(action: string, section: string, key: string) {
    unimplementedWarning("onaccelerator");
    return;
  }

  oncreatelayout(_layout) {
    unimplementedWarning("oncreatelayout");
    return;
  }

  onshowlayout(_layout) {
    unimplementedWarning("onshowlayout");
    return;
  }

  onhidelayout(_layout) {
    unimplementedWarning("onhidelayout");
    return;
  }

  onstop() {
    unimplementedWarning("onstop");
    return;
  }

  onplay() {
    unimplementedWarning("onplay");
    return;
  }

  onpause() {
    unimplementedWarning("onpause");
    return;
  }

  onresume() {
    unimplementedWarning("onresume");
    return;
  }

  ontitlechange(newtitle: string) {
    unimplementedWarning("ontitlechange");
    return;
  }

  ontitle2change(newtitle2: string) {
    unimplementedWarning("ontitle2change");
    return;
  }

  oninfochange(info: string) {
    unimplementedWarning("oninfochange");
    return;
  }

  onstatusmsg(msg: string) {
    unimplementedWarning("onstatusmsg");
    return;
  }

  oneqbandchanged(band: number, newvalue: number) {
    unimplementedWarning("oneqbandchanged");
    return;
  }

  oneqpreampchanged(newvalue: number) {
    unimplementedWarning("oneqpreampchanged");
    return;
  }

  onvolumechanged(newvol: number) {
    unimplementedWarning("onvolumechanged");
    return;
  }

  onseek(newpos: number) {
    unimplementedWarning("onseek");
    return;
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

  getmouseposx() {
    unimplementedWarning("getmouseposx");
    return;
  }

  getmouseposy() {
    unimplementedWarning("getmouseposy");
    return;
  }

  floattostring(value: number, ndigits: number) {
    unimplementedWarning("floattostring");
    return;
  }

  stringtofloat(str: string) {
    unimplementedWarning("stringtofloat");
    return;
  }

  integertolongtime(value: number) {
    unimplementedWarning("integertolongtime");
    return;
  }

  integertotime(value: number) {
    unimplementedWarning("integertotime");
    return;
  }

  datetotime(datetime: number) {
    unimplementedWarning("datetotime");
    return;
  }

  datetolongtime(datetime: number) {
    unimplementedWarning("datetolongtime");
    return;
  }

  formatdate(datetime: number) {
    unimplementedWarning("formatdate");
    return;
  }

  formatlongdate(datetime: number) {
    unimplementedWarning("formatlongdate");
    return;
  }

  getdateyear(datetime: number) {
    unimplementedWarning("getdateyear");
    return;
  }

  getdatemonth(datetime: number) {
    unimplementedWarning("getdatemonth");
    return;
  }

  getdateday(datetime: number) {
    unimplementedWarning("getdateday");
    return;
  }

  getdatedow(datetime: number) {
    unimplementedWarning("getdatedow");
    return;
  }

  getdatedoy(datetime: number) {
    unimplementedWarning("getdatedoy");
    return;
  }

  getdatehour(datetime: number) {
    unimplementedWarning("getdatehour");
    return;
  }

  getdatemin(datetime: number) {
    unimplementedWarning("getdatemin");
    return;
  }

  getdatesec(datetime: number) {
    unimplementedWarning("getdatesec");
    return;
  }

  getdatedst(datetime: number) {
    unimplementedWarning("getdatedst");
    return;
  }

  getdate() {
    unimplementedWarning("getdate");
    return;
  }

  strmid(str: string, start: number, len: number) {
    unimplementedWarning("strmid");
    return;
  }

  strleft(str: string, nchars: number) {
    unimplementedWarning("strleft");
    return;
  }

  strright(str: string, nchars: number) {
    unimplementedWarning("strright");
    return;
  }

  strsearch(str: string, substr: string) {
    unimplementedWarning("strsearch");
    return;
  }

  strlen(str: string) {
    unimplementedWarning("strlen");
    return;
  }

  strupper(str: string) {
    unimplementedWarning("strupper");
    return;
  }

  strlower(str: string) {
    unimplementedWarning("strlower");
    return;
  }

  urlencode(url: string) {
    unimplementedWarning("urlencode");
    return;
  }

  removepath(str: string) {
    unimplementedWarning("removepath");
    return;
  }

  getpath(str: string) {
    unimplementedWarning("getpath");
    return;
  }

  getextension(str: string) {
    unimplementedWarning("getextension");
    return;
  }

  sin(value: number) {
    unimplementedWarning("sin");
    return;
  }

  cos(value: number) {
    unimplementedWarning("cos");
    return;
  }

  tan(value: number) {
    unimplementedWarning("tan");
    return;
  }

  asin(value: number) {
    unimplementedWarning("asin");
    return;
  }

  acos(value: number) {
    unimplementedWarning("acos");
    return;
  }

  atan(value: number) {
    unimplementedWarning("atan");
    return;
  }

  atan2(y: number, x: number) {
    unimplementedWarning("atan2");
    return;
  }

  pow(value: number, pvalue: number) {
    unimplementedWarning("pow");
    return;
  }

  sqr(value: number) {
    unimplementedWarning("sqr");
    return;
  }

  sqrt(value: number) {
    unimplementedWarning("sqrt");
    return;
  }

  random(max: number) {
    unimplementedWarning("random");
    return;
  }

  setprivatestring(section: string, item: string, value: string) {
    unimplementedWarning("setprivatestring");
    return;
  }

  getprivatestring(section: string, item: string, defvalue: string) {
    unimplementedWarning("getprivatestring");
    return;
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

  isobjectvalid(o) {
    unimplementedWarning("isobjectvalid");
    return;
  }

  integer(d: number) {
    unimplementedWarning("integer");
    return;
  }

  frac(d: number) {
    unimplementedWarning("frac");
    return;
  }

  gettimeofday() {
    unimplementedWarning("gettimeofday");
    return;
  }

  setmenutransparency(alphavalue: number) {
    unimplementedWarning("setmenutransparency");
    return;
  }

  ongetcancelcomponent(guid: string, goingvisible: boolean) {
    unimplementedWarning("ongetcancelcomponent");
    return;
  }

  iskeydown(vk_code: number) {
    unimplementedWarning("iskeydown");
    return;
  }

  setclipboardtext(_text: string) {
    unimplementedWarning("setclipboardtext");
    return;
  }

  chr(charnum: number) {
    unimplementedWarning("chr");
    return;
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

  triggeraction(context, actionname: string, actionparam: string) {
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

  hidewindow(hw) {
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

  setatom(atomname: string, object) {
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

  onshownotification() {
    unimplementedWarning("onshownotification");
    return;
  }

  getsonginfotext() {
    unimplementedWarning("getsonginfotext");
    return;
  }

  getvisband(channel: number, band: number) {
    unimplementedWarning("getvisband");
    return;
  }
}

export default System;
