import Group from "./Group";
import MakiObject from "./MakiObject";
import { findDescendantByTypeAndId, unimplementedWarning } from "../utils";
import * as Actions from "../Actions";
import * as Selectors from "../Selectors";

class System extends MakiObject {
  constructor(scriptGroup = new Group(), store) {
    super(null, null, {}, store);

    this.scriptGroup = scriptGroup;
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

  getcontainer(id) {
    return findDescendantByTypeAndId(this.root, "container", id);
  }

  getruntimeversion() {
    return "5.666";
  }

  gettoken(str, separator, tokennum) {
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

  oneqchanged(newstatus) {
    unimplementedWarning("newstatus");
  }

  geteqband(band) {
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

  messagebox(message, msgtitle, flag, notanymoreId) {
    console.log({ message, msgtitle, flag, notanymoreId });
  }

  integertostring(value) {
    return value.toString();
  }

  stringtointeger(str) {
    return parseInt(str, 10);
  }

  getprivateint(section, item, defvalue) {
    unimplementedWarning("getprivateint");
    return defvalue;
  }

  setprivateint(section, item, defvalue) {
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

  setvolume(volume) {
    return this._store.dispatch(Actions.setVolume(volume));
  }

  getplayitemlength() {
    unimplementedWarning("getplayitemlength");
    return 100000;
  }

  seekto(pos) {
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

  onsetxuiparam(param, value) {
    unimplementedWarning("onsetxuiparam");
    return;
  }

  onkeydown(key) {
    unimplementedWarning("onkeydown");
    return;
  }

  onaccelerator(action, section, key) {
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

  ontitlechange(newtitle) {
    unimplementedWarning("ontitlechange");
    return;
  }

  ontitle2change(newtitle2) {
    unimplementedWarning("ontitle2change");
    return;
  }

  oninfochange(info) {
    unimplementedWarning("oninfochange");
    return;
  }

  onstatusmsg(msg) {
    unimplementedWarning("onstatusmsg");
    return;
  }

  oneqbandchanged(band, newvalue) {
    unimplementedWarning("oneqbandchanged");
    return;
  }

  oneqpreampchanged(newvalue) {
    unimplementedWarning("oneqpreampchanged");
    return;
  }

  onvolumechanged(newvol) {
    unimplementedWarning("onvolumechanged");
    return;
  }

  onseek(newpos) {
    unimplementedWarning("onseek");
    return;
  }

  newdynamiccontainer(container_id) {
    unimplementedWarning("newdynamiccontainer");
    return;
  }

  newgroup(group_id) {
    unimplementedWarning("newgroup");
    return;
  }

  newgroupaslayout(group_id) {
    unimplementedWarning("newgroupaslayout");
    return;
  }

  getnumcontainers() {
    unimplementedWarning("getnumcontainers");
    return;
  }

  enumcontainer(num) {
    unimplementedWarning("enumcontainer");
    return;
  }

  getwac(wac_guid) {
    unimplementedWarning("getwac");
    return;
  }

  getplayitemmetadatastring(metadataname) {
    unimplementedWarning("getplayitemmetadatastring");
    return;
  }

  getplayitemdisplaytitle() {
    unimplementedWarning("getplayitemdisplaytitle");
    return;
  }

  getextfamily(ext) {
    unimplementedWarning("getextfamily");
    return;
  }

  playfile(playitem) {
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

  seteqband(band, value) {
    unimplementedWarning("seteqband");
    return;
  }

  seteqpreamp(value) {
    unimplementedWarning("seteqpreamp");
    return;
  }

  seteq(onoff) {
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

  floattostring(value, ndigits) {
    unimplementedWarning("floattostring");
    return;
  }

  stringtofloat(str) {
    unimplementedWarning("stringtofloat");
    return;
  }

  integertolongtime(value) {
    unimplementedWarning("integertolongtime");
    return;
  }

  integertotime(value) {
    unimplementedWarning("integertotime");
    return;
  }

  datetotime(datetime) {
    unimplementedWarning("datetotime");
    return;
  }

  datetolongtime(datetime) {
    unimplementedWarning("datetolongtime");
    return;
  }

  formatdate(datetime) {
    unimplementedWarning("formatdate");
    return;
  }

  formatlongdate(datetime) {
    unimplementedWarning("formatlongdate");
    return;
  }

  getdateyear(datetime) {
    unimplementedWarning("getdateyear");
    return;
  }

  getdatemonth(datetime) {
    unimplementedWarning("getdatemonth");
    return;
  }

  getdateday(datetime) {
    unimplementedWarning("getdateday");
    return;
  }

  getdatedow(datetime) {
    unimplementedWarning("getdatedow");
    return;
  }

  getdatedoy(datetime) {
    unimplementedWarning("getdatedoy");
    return;
  }

  getdatehour(datetime) {
    unimplementedWarning("getdatehour");
    return;
  }

  getdatemin(datetime) {
    unimplementedWarning("getdatemin");
    return;
  }

  getdatesec(datetime) {
    unimplementedWarning("getdatesec");
    return;
  }

  getdatedst(datetime) {
    unimplementedWarning("getdatedst");
    return;
  }

  getdate() {
    unimplementedWarning("getdate");
    return;
  }

  strmid(str, start, len) {
    unimplementedWarning("strmid");
    return;
  }

  strleft(str, nchars) {
    unimplementedWarning("strleft");
    return;
  }

  strright(str, nchars) {
    unimplementedWarning("strright");
    return;
  }

  strsearch(str, substr) {
    unimplementedWarning("strsearch");
    return;
  }

  strlen(str) {
    unimplementedWarning("strlen");
    return;
  }

  strupper(str) {
    unimplementedWarning("strupper");
    return;
  }

  strlower(str) {
    unimplementedWarning("strlower");
    return;
  }

  urlencode(url) {
    unimplementedWarning("urlencode");
    return;
  }

  removepath(str) {
    unimplementedWarning("removepath");
    return;
  }

  getpath(str) {
    unimplementedWarning("getpath");
    return;
  }

  getextension(str) {
    unimplementedWarning("getextension");
    return;
  }

  sin(value) {
    unimplementedWarning("sin");
    return;
  }

  cos(value) {
    unimplementedWarning("cos");
    return;
  }

  tan(value) {
    unimplementedWarning("tan");
    return;
  }

  asin(value) {
    unimplementedWarning("asin");
    return;
  }

  acos(value) {
    unimplementedWarning("acos");
    return;
  }

  atan(value) {
    unimplementedWarning("atan");
    return;
  }

  atan2(y, x) {
    unimplementedWarning("atan2");
    return;
  }

  pow(value, pvalue) {
    unimplementedWarning("pow");
    return;
  }

  sqr(value) {
    unimplementedWarning("sqr");
    return;
  }

  sqrt(value) {
    unimplementedWarning("sqrt");
    return;
  }

  random(max) {
    unimplementedWarning("random");
    return;
  }

  setprivatestring(section, item, value) {
    unimplementedWarning("setprivatestring");
    return;
  }

  getprivatestring(section, item, defvalue) {
    unimplementedWarning("getprivatestring");
    return;
  }

  setpublicstring(item, value) {
    unimplementedWarning("setpublicstring");
    return;
  }

  setpublicint(item, value) {
    unimplementedWarning("setpublicint");
    return;
  }

  getpublicstring(item, defvalue) {
    unimplementedWarning("getpublicstring");
    return;
  }

  getpublicint(item, defvalue) {
    unimplementedWarning("getpublicint");
    return;
  }

  getviewportwidthfrompoint(x, y) {
    unimplementedWarning("getviewportwidthfrompoint");
    return;
  }

  getviewportheightfrompoint(x, y) {
    unimplementedWarning("getviewportheightfrompoint");
    return;
  }

  getviewportleft() {
    unimplementedWarning("getviewportleft");
    return;
  }

  getviewportleftfrompoint(x, y) {
    unimplementedWarning("getviewportleftfrompoint");
    return;
  }

  getviewporttop() {
    unimplementedWarning("getviewporttop");
    return;
  }

  getviewporttopfrompoint(x, y) {
    unimplementedWarning("getviewporttopfrompoint");
    return;
  }

  debugstring(str, severity) {
    unimplementedWarning("debugstring");
    return;
  }

  ddesend(application, command, mininterval) {
    unimplementedWarning("ddesend");
    return;
  }

  onlookforcomponent(guid) {
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

  switchskin(skinname) {
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

  navigateurl(url) {
    unimplementedWarning("navigateurl");
    return;
  }

  isobjectvalid(o) {
    unimplementedWarning("isobjectvalid");
    return;
  }

  integer(d) {
    unimplementedWarning("integer");
    return;
  }

  frac(d) {
    unimplementedWarning("frac");
    return;
  }

  gettimeofday() {
    unimplementedWarning("gettimeofday");
    return;
  }

  setmenutransparency(alphavalue) {
    unimplementedWarning("setmenutransparency");
    return;
  }

  ongetcancelcomponent(guid, goingvisible) {
    unimplementedWarning("ongetcancelcomponent");
    return;
  }

  iskeydown(vk_code) {
    unimplementedWarning("iskeydown");
    return;
  }

  setclipboardtext(_text) {
    unimplementedWarning("setclipboardtext");
    return;
  }

  chr(charnum) {
    unimplementedWarning("chr");
    return;
  }

  selectfile(extlist, id, prev_filename) {
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

  triggeraction(context, actionname, actionparam) {
    unimplementedWarning("triggeraction");
    return;
  }

  showwindow(guidorgroupid, preferedcontainer, transient) {
    unimplementedWarning("showwindow");
    return;
  }

  hidewindow(hw) {
    unimplementedWarning("hidewindow");
    return;
  }

  hidenamedwindow(guidorgroup) {
    unimplementedWarning("hidenamedwindow");
    return;
  }

  isnamedwindowvisible(guidorgroup) {
    unimplementedWarning("isnamedwindowvisible");
    return;
  }

  setatom(atomname, object) {
    unimplementedWarning("setatom");
    return;
  }

  getatom(atomname) {
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

  getvisband(channel, band) {
    unimplementedWarning("getvisband");
    return;
  }
}

export default System;
