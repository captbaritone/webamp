export interface MakiObject {
  getclassname(): string;
  getid(): string;
  onnotify(command: string, param: string, a: number, b: number): number;
}

export interface System extends MakiObject {
  onscriptloaded(): void;
  onscriptunloading(): void;
  onquit(): void;
  onsetxuiparam(param: string, value: string): void;
  onkeydown(key: string): void;
  onaccelerator(action: string, section: string, key: string): void;
  oncreatelayout(_layout: Layout): void;
  onshowlayout(_layout: Layout): void;
  onhidelayout(_layout: Layout): void;
  onviewportchanged(width: number, height: number): void;
  onstop(): void;
  onplay(): void;
  onpause(): void;
  onresume(): void;
  ontitlechange(newtitle: string): void;
  ontitle2change(newtitle2: string): void;
  onurlchange(url: string): void;
  oninfochange(info: string): void;
  onstatusmsg(msg: string): void;
  oneqbandchanged(band: number, newvalue: number): void;
  oneqpreampchanged(newvalue: number): void;
  oneqchanged(newstatus: number): void;
  oneqfreqchanged(isiso: number): void;
  onvolumechanged(newvol: number): void;
  onseek(newpos: number): void;
  getcontainer(container_id: string): Container;
  newdynamiccontainer(container_id: string): Container;
  newgroup(group_id: string): Group;
  newgroupaslayout(group_id: string): Layout;
  getnumcontainers(): number;
  enumcontainer(num: number): Container;
  enumembedguid(num: number): string;
  getwac(wac_guid: string): Wac;
  messagebox(message: string, msgtitle: string, flag: number, notanymore_id: string): number;
  getplayitemstring(): string;
  getplayitemlength(): number;
  getplayitemmetadatastring(metadataname: string): string;
  getmetadatastring(filename: string, metadataname: string): string;
  getplayitemdisplaytitle(): string;
  getcurrenttrackrating(): number;
  oncurrenttrackrated(rating: number): void;
  setcurrenttrackrating(rating: number): void;
  getextfamily(ext: string): string;
  getdecodername(playitem: string): string;
  playfile(playitem: string): void;
  getalbumart(playitem: string): number;
  downloadmedia(url: string, destinationPath: string, wantAddToML: boolean, notifyDownloadsList: boolean): void;
  downloadurl(url: string, destination_filename: string, progress_dialog_title: string): void;
  ondownloadfinished(url: string, success: boolean, filename: string): void;
  getdownloadpath(): string;
  setdownloadpath(new_path: string): void;
  enqueuefile(playitem: string): void;
  getleftvumeter(): number;
  getrightvumeter(): number;
  getvolume(): number;
  setvolume(vol: number): void;
  play(): void;
  stop(): void;
  pause(): void;
  next(): void;
  previous(): void;
  eject(): void;
  seekto(pos: number): void;
  getposition(): number;
  seteqband(band: number, value: number): void;
  seteqpreamp(value: number): void;
  seteq(onoff: number): void;
  geteqband(band: number): number;
  geteqpreamp(): number;
  geteq(): number;
  getmouseposx(): number;
  getmouseposy(): number;
  integertostring(value: number): string;
  stringtointeger(str: string): number;
  floattostring(value: number, ndigits: number): string;
  stringtofloat(str: string): number;
  integertolongtime(value: number): string;
  integertotime(value: number): string;
  datetotime(datetime: number): string;
  datetolongtime(datetime: number): string;
  formatdate(datetime: number): string;
  formatlongdate(datetime: number): string;
  getdateyear(datetime: number): number;
  getdatemonth(datetime: number): number;
  getdateday(datetime: number): number;
  getdatedow(datetime: number): number;
  getdatedoy(datetime: number): number;
  getdatehour(datetime: number): number;
  getdatemin(datetime: number): number;
  getdatesec(datetime: number): number;
  getdatedst(datetime: number): number;
  getdate(): number;
  strmid(str: string, start: number, len: number): string;
  strleft(str: string, nchars: number): string;
  strright(str: string, nchars: number): string;
  strsearch(str: string, substr: string): number;
  strlen(str: string): number;
  strupper(str: string): string;
  strlower(str: string): string;
  urlencode(url: string): string;
  urldecode(url: string): string;
  parseatf(topass: string): string;
  removepath(str: string): string;
  getpath(str: string): string;
  getextension(str: string): string;
  gettoken(str: string, separator: string, tokennum: number): string;
  sin(value: number): number;
  cos(value: number): number;
  tan(value: number): number;
  asin(value: number): number;
  acos(value: number): number;
  atan(value: number): number;
  atan2(y: number, x: number): number;
  pow(value: number, pvalue: number): number;
  sqr(value: number): number;
  log10(value: number): number;
  ln(value: number): number;
  sqrt(value: number): number;
  random(max: number): number;
  setprivatestring(section: string, item: string, value: string): void;
  setprivateint(section: string, item: string, value: number): void;
  getprivatestring(section: string, item: string, defvalue: string): string;
  getprivateint(section: string, item: string, defvalue: number): number;
  setpublicstring(item: string, value: string): void;
  setpublicint(item: string, value: number): void;
  getpublicstring(item: string, defvalue: string): string;
  getpublicint(item: string, defvalue: number): number;
  getparam(): string;
  getscriptgroup(): Group;
  getviewportwidth(): number;
  getviewportwidthfromguiobject(g: GuiObject): number;
  getviewportwidthfrompoint(x: number, y: number): number;
  getmonitorwidth(): number;
  getmonitorwidthfrompoint(x: number, y: number): number;
  getmonitorwidthfromguiobject(g: GuiObject): number;
  onmousemove(x: number, y: number): void;
  getviewportheight(): number;
  getviewportheightfromguiobject(g: GuiObject): number;
  getviewportheightfrompoint(x: number, y: number): number;
  getmonitorheight(): number;
  getmonitorheightfrompoint(x: number, y: number): number;
  getmonitorheightfromguiobject(g: GuiObject): number;
  getmonitorleft(): number;
  getmonitorleftfromguiobject(g: GuiObject): number;
  getmonitorleftfrompoint(x: number, y: number): number;
  getmonitortop(): number;
  getmonitortopfromguiobject(g: GuiObject): number;
  getmonitortopfrompoint(x: number, y: number): number;
  getviewportleft(): number;
  getviewportleftfromguiobject(g: GuiObject): number;
  getviewportleftfrompoint(x: number, y: number): number;
  getviewporttop(): number;
  getviewporttopfromguiobject(g: GuiObject): number;
  getviewporttopfrompoint(x: number, y: number): number;
  debugstring(str: string, severity: number): void;
  ddesend(application: string, command: string, mininterval: number): void;
  onlookforcomponent(guid: string): WindowHolder;
  getcurappleft(): number;
  getcurapptop(): number;
  getcurappwidth(): number;
  getcurappheight(): number;
  isappactive(): boolean;
  getskinname(): string;
  switchskin(skinname: string): void;
  isloadingskin(): number;
  lockui(): void;
  unlockui(): void;
  getmainbrowser(): Browser;
  popmainbrowser(): void;
  navigateurl(url: string): void;
  navigateurlbrowser(url: string): void;
  onopenurl(url: string): boolean;
  isobjectvalid(o: MakiObject): boolean;
  integer(d: number): number;
  frac(d: number): number;
  gettimeofday(): number;
  setmenutransparency(alphavalue: number): void;
  ongetcancelcomponent(guid: string, goingvisible: boolean): boolean;
  getstatus(): number;
  iskeydown(vk_code: number): number;
  setclipboardtext(_text: string): void;
  chr(charnum: number): string;
  translate(str: string): string;
  getstring(table: string, id: number): string;
  getlanguageid(): string;
  selectfile(extlist: string, id: string, prev_filename: string): string;
  selectfolder(wnd_title: string, wnd_info: string, default_path: string): string;
  systemmenu(): void;
  windowmenu(): void;
  triggeraction(context: GuiObject, actionname: string, actionparam: string): void;
  showwindow(guidorgroupid: string, preferedcontainer: string, transient: boolean): GuiObject;
  hidewindow(hw: GuiObject): void;
  hidenamedwindow(guidorgroup: string): void;
  isnamedwindowvisible(guidorgroup: string): boolean;
  setatom(atomname: string, object: MakiObject): void;
  getatom(atomname: string): MakiObject;
  invokedebugger(): void;
  hasvideosupport(): number;
  isvideo(): number;
  isvideofullscreen(): number;
  getidealvideowidth(): number;
  getidealvideoheight(): number;
  isminimized(): number;
  minimizeapplication(): void;
  restoreapplication(): void;
  activateapplication(): void;
  getplaylistlength(): number;
  getplaylistindex(): number;
  clearplaylist(): void;
  isdesktopalphaavailable(): boolean;
  istransparencyavailable(): boolean;
  onshownotification(): number;
  getsonginfotext(): string;
  getsonginfotexttranslated(): string;
  getvisband(channel: number, band: number): number;
  getruntimeversion(): number;
  iswa2componentvisible(guid: string): number;
  hidewa2component(guid: string): void;
  isproversion(): boolean;
  getwinampversion(): string;
  getbuildnumber(): number;
  getfilesize(fullfilename: string): number;
}

export interface Container extends MakiObject {
  onswitchtolayout(newlayout: Layout): void;
  onbeforeswitchtolayout(oldlayout: Layout, newlayout: Layout): void;
  setxmlparam(param: string, value: string): void;
  onhidelayout(_layout: Layout): void;
  onshowlayout(_layout: Layout): void;
  getlayout(layout_id: string): Layout;
  getnumlayouts(): number;
  enumlayout(num: number): Layout;
  switchtolayout(layout_id: string): void;
  show(): void;
  hide(): void;
  close(): void;
  toggle(): void;
  isdynamic(): number;
  setname(name: string): void;
  getname(): string;
  getguid(): string;
  getcurlayout(): Layout;
  onaddcontent(wnd: GuiObject, id: string, guid: string): void;
}

export interface Wac extends MakiObject {
  getguid(): string;
  getname(): string;
  sendcommand(cmd: string, param1: number, param2: number, param3: string): number;
  show(): void;
  hide(): void;
  isvisible(): boolean;
  onnotify(command: string, param: string, a: number, b: number): number;
  onshow(): void;
  onhide(): void;
  setstatusbar(onoff: boolean): void;
  getstatusbar(): boolean;
}

export interface List extends MakiObject {
  additem(_object: any): void;
  removeitem(pos: number): void;
  enumitem(pos: number): any;
  finditem(_object: any): number;
  finditem2(_object: any, startItem: number): number;
  getnumitems(): number;
  removeall(): void;
}

export interface BitList extends MakiObject {
  getitem(n: number): boolean;
  setitem(n: number, val: boolean): void;
  setsize(s: number): void;
  getsize(): number;
}

export interface MakiMap extends MakiObject {
  getvalue(x: number, y: number): number;
  getargbvalue(x: number, y: number, channel: number): number;
  inregion(x: number, y: number): boolean;
  loadmap(bitmapid: string): void;
  getwidth(): number;
  getheight(): number;
  getregion(): Region;
}

export interface PopupMenu extends MakiObject {
  addsubmenu(submenu: PopupMenu, submenutext: string): void;
  addcommand(cmdtxt: string, cmd_id: number, checked: boolean, disabled: boolean): void;
  addseparator(): void;
  popatxy(x: number, y: number): number;
  popatmouse(): number;
  getnumcommands(): number;
  checkcommand(cmd_id: number, check: boolean): void;
  disablecommand(cmd_id: number, disable: boolean): void;
}

export interface Region extends MakiObject {
  add(reg: Region): void;
  sub(reg: Region): void;
  offset(x: number, y: number): void;
  stretch(r: number): void;
  copy(reg: Region): void;
  loadfrommap(regionmap: MakiMap, threshold: number, reversed: boolean): void;
  loadfrombitmap(bitmapid: string): void;
  getboundingboxx(): number;
  getboundingboxy(): number;
  getboundingboxw(): number;
  getboundingboxh(): number;
}

export interface Timer extends MakiObject {
  ontimer(): void;
  setdelay(millisec: number): void;
  getdelay(): number;
  start(): void;
  stop(): void;
  isrunning(): boolean;
  getskipped(): number;
}

export interface FeedWatcher extends MakiObject {
  setfeed(feed_id: string): number;
  releasefeed(): void;
  onfeedchange(new_feeddata: string): void;
}

export interface GuiObject extends MakiObject {
  show(): void;
  hide(): void;
  isvisible(): number;
  onsetvisible(onoff: boolean): void;
  setalpha(alpha: number): void;
  getalpha(): number;
  onleftbuttonup(x: number, y: number): void;
  onleftbuttondown(x: number, y: number): void;
  onrightbuttonup(x: number, y: number): void;
  onrightbuttondown(x: number, y: number): void;
  onrightbuttondblclk(x: number, y: number): void;
  onleftbuttondblclk(x: number, y: number): void;
  onmousewheelup(clicked: number, lines: number): number;
  onmousewheeldown(clicked: number, lines: number): number;
  onmousemove(x: number, y: number): void;
  onenterarea(): void;
  onleavearea(): void;
  setenabled(onoff: boolean): void;
  getenabled(): boolean;
  onenable(onoff: boolean): void;
  resize(x: number, y: number, w: number, h: number): void;
  onresize(x: number, y: number, w: number, h: number): void;
  ismouseover(x: number, y: number): boolean;
  getleft(): number;
  gettop(): number;
  getwidth(): number;
  getheight(): number;
  settargetx(x: number): void;
  settargety(y: number): void;
  settargetw(w: number): void;
  settargeth(r: number): void;
  settargeta(alpha: number): void;
  settargetspeed(insecond: number): void;
  gototarget(): void;
  ontargetreached(): void;
  canceltarget(): void;
  reversetarget(reverse: number): void;
  onstartup(): void;
  isgoingtotarget(): boolean;
  setxmlparam(param: string, value: string): void;
  getxmlparam(param: string): string;
  init(parent: Group): void;
  bringtofront(): void;
  bringtoback(): void;
  bringabove(guiobj: GuiObject): void;
  bringbelow(guiobj: GuiObject): void;
  getguix(): number;
  getguiy(): number;
  getguiw(): number;
  getguih(): number;
  getguirelatx(): number;
  getguirelaty(): number;
  getguirelatw(): number;
  getguirelath(): number;
  isactive(): boolean;
  getparent(): GuiObject;
  getparentlayout(): Layout;
  gettopparent(): GuiObject;
  runmodal(): number;
  endmodal(retcode: number): void;
  findobject(id: string): GuiObject;
  findobjectxy(x: number, y: number): GuiObject;
  getname(): string;
  clienttoscreenx(x: number): number;
  clienttoscreeny(y: number): number;
  clienttoscreenw(w: number): number;
  clienttoscreenh(h: number): number;
  screentoclientx(x: number): number;
  screentoclienty(y: number): number;
  screentoclientw(w: number): number;
  screentoclienth(h: number): number;
  getautowidth(): number;
  getautoheight(): number;
  setfocus(): void;
  onchar(c: string): void;
  onaccelerator(accel: string): void;
  ismouseoverrect(): boolean;
  getinterface(interface_guid: string): MakiObject;
  ondragenter(): void;
  ondragover(x: number, y: number): void;
  ondragleave(): void;
  onkeydown(vk_code: number): void;
  onkeyup(vk_code: number): void;
  ongetfocus(): void;
  onkillfocus(): void;
  sendaction(action: string, param: string, x: number, y: number, p1: number, p2: number): number;
  onaction(action: string, param: string, x: number, y: number, p1: number, p2: number, source: GuiObject): number;
}

export interface Group extends GuiObject {
  getobject(object_id: string): GuiObject;
  getnumobjects(): number;
  enumobject(num: number): GuiObject;
  oncreateobject(newobj: GuiObject): void;
  getmouseposx(): number;
  getmouseposy(): number;
  islayout(): boolean;
}

export interface Layout extends Group {
  ondock(side: number): void;
  onundock(): void;
  onscale(newscalevalue: number): void;
  getscale(): number;
  setscale(scalevalue: number): void;
  setdesktopalpha(onoff: boolean): void;
  getdesktopalpha(): boolean;
  getcontainer(): Container;
  center(): void;
  onmove(): void;
  onendmove(): void;
  onuserresize(x: number, y: number, w: number, h: number): void;
  snapadjust(left: number, top: number, right: number, bottom: number): void;
  getsnapadjusttop(): number;
  getsnapadjustright(): number;
  getsnapadjustleft(): number;
  getsnapadjustbottom(): number;
  setredrawonresize(wantredrawonresize: number): void;
  beforeredock(): void;
  redock(): void;
  istransparencysafe(): boolean;
  islayoutanimationsafe(): boolean;
  onmouseenterlayout(): void;
  onmouseleavelayout(): void;
  onsnapadjustchanged(): void;
}

export interface WindowHolder extends GuiObject {
  setregionfrommap(regionmap: MakiMap, threshold: number, reverse: boolean): void;
  setregion(reg: Region): void;
  getcontent(): GuiObject;
  getguid(): string;
  getcomponentname(): string;
  ongetwac(wacobj: Wac): void;
  ongiveupwac(wacobj: Wac): void;
  getwac(): Wac;
  setacceptwac(onoff: boolean): void;
}

export interface ComponentBucket extends GuiObject {
  getmaxheight(): number;
  getmaxwidth(): number;
  setscroll(x: number): number;
  getscroll(): number;
  getnumchildren(): number;
  enumchildren(n: number): GuiObject;
}

export interface Edit extends GuiObject {
  onenter(): void;
  onabort(): void;
  onidleeditupdate(): void;
  oneditupdate(): void;
  settext(txt: string): void;
  setautoenter(onoff: boolean): void;
  getautoenter(): number;
  gettext(): string;
  selectall(): void;
  enter(): void;
  setidleenabled(onoff: boolean): void;
  getidleenabled(): number;
}

export interface Slider extends GuiObject {
  onsetposition(newpos: number): void;
  onpostedposition(newpos: number): void;
  onsetfinalposition(pos: number): void;
  setposition(pos: number): void;
  getposition(): number;
  lock(): void;
  unlock(): void;
}

export interface Vis extends GuiObject {
  onframe(): void;
  setrealtime(onoff: boolean): void;
  getrealtime(): boolean;
  getmode(): number;
  setmode(mode: number): void;
  nextmode(): void;
}

export interface Browser extends GuiObject {
  navigateurl(url: string): void;
  back(): void;
  forward(): void;
  stop(): void;
  refresh(): void;
  home(): void;
  settargetname(targetname: string): void;
  onbeforenavigate(url: string, flags: number, targetframename: string): boolean;
  ondocumentcomplete(url: string): void;
  ondocumentready(url: string): void;
  getdocumenttitle(): string;
  onnavigateerror(url: string, code: number): void;
  setcancelieerrorpage(cancel: boolean): void;
  scrape(): void;
  onmedialink(url: string): string;
}

export interface EqVis extends GuiObject {

}

export interface Status extends GuiObject {

}

export interface Text extends GuiObject {
  settext(txt: string): void;
  setalternatetext(txt: string): void;
  gettext(): string;
  gettextwidth(): number;
  ontextchanged(newtxt: string): void;
}

export interface Title extends GuiObject {

}

export interface Layer extends GuiObject {
  onbeginresize(x: number, y: number, w: number, h: number): void;
  onendresize(x: number, y: number, w: number, h: number): void;
  fx_oninit(): void;
  fx_onframe(): void;
  fx_ongetpixelr(r: number, d: number, x: number, y: number): number;
  fx_ongetpixeld(r: number, d: number, x: number, y: number): number;
  fx_ongetpixelx(r: number, d: number, x: number, y: number): number;
  fx_ongetpixely(r: number, d: number, x: number, y: number): number;
  fx_ongetpixela(r: number, d: number, x: number, y: number): number;
  setregionfrommap(regionmap: MakiMap, threshold: number, reverse: boolean): void;
  setregion(reg: Region): void;
  fx_setenabled(onoff: boolean): void;
  fx_getenabled(): boolean;
  fx_setwrap(onoff: boolean): void;
  fx_getwrap(): boolean;
  fx_setrect(onoff: boolean): void;
  fx_getrect(): boolean;
  fx_setbgfx(onoff: boolean): void;
  fx_getbgfx(): boolean;
  fx_setclear(onoff: boolean): void;
  fx_getclear(): boolean;
  fx_setspeed(msperframe: number): void;
  fx_getspeed(): number;
  fx_setrealtime(onoff: boolean): void;
  fx_getrealtime(): boolean;
  fx_setlocalized(onoff: boolean): void;
  fx_getlocalized(): boolean;
  fx_setbilinear(onoff: boolean): void;
  fx_getbilinear(): boolean;
  fx_setalphamode(onoff: boolean): void;
  fx_getalphamode(): boolean;
  fx_setgridsize(x: number, y: number): void;
  fx_update(): void;
  fx_restart(): void;
  isinvalid(): boolean;
}

export interface Button extends GuiObject {
  onactivate(activated: number): void;
  onleftclick(): void;
  onrightclick(): void;
  setactivated(onoff: boolean): void;
  setactivatednocallback(onoff: boolean): void;
  getactivated(): boolean;
  leftclick(): void;
  rightclick(): void;
}

export interface AnimatedLayer extends Layer {
  onplay(): void;
  onpause(): void;
  onresume(): void;
  onstop(): void;
  onframe(framenum: number): void;
  setspeed(msperframe: number): void;
  gotoframe(framenum: number): void;
  setstartframe(framenum: number): void;
  setendframe(framenum: number): void;
  setautoreplay(onoff: boolean): void;
  play(): void;
  stop(): void;
  pause(): void;
  isplaying(): boolean;
  ispaused(): boolean;
  isstopped(): boolean;
  getstartframe(): number;
  getendframe(): number;
  getlength(): number;
  getdirection(): number;
  getautoreplay(): boolean;
  getcurframe(): number;
  setrealtime(onoff: boolean): void;
}

export interface AlbumArtLayer extends Layer {
  refresh(): void;
  isloading(): void;
  onalbumartloaded(success: boolean): void;
}

export interface ToggleButton extends Button {
  ontoggle(onoff: boolean): void;
  getcurcfgval(): number;
}

export interface GroupList extends GuiObject {
  instantiate(group_id: string, num_groups: number): Group;
  getnumitems(): number;
  enumitem(num: number): Group;
  removeall(): void;
  scrolltopercent(percent: number): void;
  setredraw(redraw: number): void;
}

export interface CfgGroup extends Group {
  cfggetint(): number;
  cfgsetint(intvalue: number): void;
  cfggetstring(): string;
  cfggetfloat(): number;
  cfgsetfloat(floatvalue: number): void;
  cfgsetstring(strvalue: string): void;
  oncfgchanged(): void;
  cfggetguid(): string;
  cfggetname(): string;
}

export interface QueryList extends GuiObject {
  onresetquery(): void;
}

export interface MouseRedir extends GuiObject {
  setredirection(o: GuiObject): void;
  getredirection(): GuiObject;
  setregionfrommap(regionmap: MakiMap, threshold: number, reverse: boolean): void;
  setregion(reg: Region): void;
}

export interface DropDownList extends GuiObject {
  getitemselected(): string;
  onselect(id: number, hover: number): void;
  setlistheight(h: number): void;
  openlist(): void;
  closelist(): void;
  setitems(lotsofitems: string): void;
  additem(_text: string): number;
  delitem(id: number): void;
  finditem(_text: string): number;
  getnumitems(): number;
  selectitem(id: number, hover: number): void;
  getitemtext(id: number): string;
  getselected(): number;
  getselectedtext(): string;
  getcustomtext(): string;
  deleteallitems(): void;
  setnoitemtext(txt: string): void;
}

export interface LayoutStatus extends GuiObject {
  callme(str: string): void;
}

export interface TabSheet extends GuiObject {
  getcurpage(): number;
  setcurpage(a: number): void;
}

export interface GuiList extends GuiObject {
  addcolumn(name: string, width: number, numeric: number): number;
  getnumcolumns(): number;
  getcolumnwidth(column: number): number;
  setcolumnwidth(column: number, newwidth: number): void;
  getcolumnlabel(column: number): string;
  setcolumnlabel(column: number, newlabel: string): void;
  getcolumnnumeric(column: number): number;
  setcolumndynamic(column: number, isdynamic: number): void;
  iscolumndynamic(column: number): number;
  invalidatecolumns(): void;
  getnumitems(): number;
  getitemcount(): number;
  additem(label: string): number;
  insertitem(pos: number, label: string): number;
  getlastaddeditempos(): number;
  setsubitem(pos: number, subpos: number, txt: string): void;
  deleteallitems(): void;
  deletebypos(pos: number): number;
  getitemlabel(pos: number, subpos: number): string;
  getsubitemtext(pos: number, subpos: number): string;
  setitemlabel(pos: number, _text: string): void;
  invalidateitem(pos: number): number;
  getfirstitemvisible(): number;
  getlastitemvisible(): number;
  setitemicon(pos: number, bitmapId: string): void;
  getitemicon(pos: number): string;
  setminimumsize(size: number): void;
  getwantautodeselect(): number;
  setwantautodeselect(want: number): void;
  onsetvisible(show: boolean): void;
  setautosort(dosort: number): void;
  setfontsize(size: number): number;
  getfontsize(): number;
  getheaderheight(): number;
  getpreventmultipleselection(): number;
  setpreventmultipleselection(val: number): number;
  setshowicons(showThem: number): void;
  getshowicons(): number;
  seticonwidth(width: number): number;
  seticonheight(width: number): number;
  geticonwidth(): void;
  geticonheight(): void;
  next(): void;
  previous(): void;
  pagedown(): void;
  pageup(): void;
  home(): void;
  end(): void;
  reset(): void;
  ensureitemvisible(pos: number): void;
  scrollabsolute(x: number): number;
  scrollrelative(x: number): number;
  scrollleft(lines: number): void;
  scrollright(lines: number): void;
  scrollup(lines: number): void;
  scrolldown(lines: number): void;
  jumptonext(c: number): void;
  scrolltoitem(pos: number): void;
  selectcurrent(): void;
  selectfirstentry(): void;
  getitemselected(pos: number): number;
  isitemfocused(pos: number): number;
  getitemfocused(): number;
  setitemfocused(pos: number): void;
  getfirstitemselected(): number;
  getnextitemselected(lastpos: number): number;
  selectall(): number;
  deselectall(): number;
  invertselection(): number;
  setselectionstart(pos: number): void;
  setselectionend(pos: number): void;
  setselected(pos: number, selected: number): void;
  toggleselection(pos: number, setfocus: number): void;
  resort(): void;
  getsortdirection(): number;
  getsortcolumn(): number;
  setsortcolumn(col: number): void;
  setsortdirection(dir: number): void;
  moveitem(from: number, to: number): void;
  onselectall(): void;
  ondelete(): void;
  ondoubleclick(itemnum: number): void;
  onleftclick(itemnum: number): void;
  onsecondleftclick(itemnum: number): void;
  onrightclick(itemnum: number): number;
  oncolumndblclick(col: number, x: number, y: number): number;
  oncolumnlabelclick(col: number, x: number, y: number): number;
  onitemselection(itemnum: number, selected: number): void;
  oniconleftclick(itemnum: number, x: number, y: number): number;
}

export interface GuiTree extends GuiObject {
  onwantautocontextmenu(): number;
  onmousewheelup(clicked: number, lines: number): number;
  onmousewheeldown(clicked: number, lines: number): number;
  oncontextmenu(x: number, y: number): number;
  onchar(c: string): number;
  onitemrecvdrop(item: TreeItem): void;
  onlabelchange(item: TreeItem): void;
  onitemselected(item: TreeItem): void;
  onitemdeselected(item: TreeItem): void;
  getnumrootitems(): number;
  enumrootitem(which: number): TreeItem;
  jumptonext(c: number): void;
  ensureitemvisible(item: TreeItem): void;
  getcontentswidth(): number;
  getcontentsheight(): number;
  addtreeitem(item: TreeItem, par: TreeItem, sorted: number, haschildtab: number): TreeItem;
  removetreeitem(item: TreeItem): number;
  movetreeitem(item: TreeItem, newparent: TreeItem): void;
  deleteallitems(): void;
  expanditem(item: TreeItem): number;
  expanditemdeferred(item: TreeItem): void;
  collapseitem(item: TreeItem): number;
  collapseitemdeferred(item: TreeItem): void;
  selectitem(item: TreeItem): void;
  selectitemdeferred(item: TreeItem): void;
  delitemdeferred(item: TreeItem): void;
  hiliteitem(item: TreeItem): void;
  unhiliteitem(item: TreeItem): void;
  getcuritem(): TreeItem;
  hittest(x: number, y: number): TreeItem;
  edititemlabel(item: TreeItem): void;
  canceleditlabel(destroyit: number): void;
  setautoedit(ae: number): void;
  getautoedit(): number;
  getbylabel(item: TreeItem, name: string): TreeItem;
  setsorted(dosort: number): void;
  getsorted(): number;
  sorttreeitems(): void;
  getsibling(item: TreeItem): TreeItem;
  setautocollapse(doautocollapse: number): void;
  setfontsize(newsize: number): number;
  getfontsize(): number;
  getnumvisiblechilditems(c: TreeItem): number;
  getnumvisibleitems(): number;
  enumvisibleitems(n: number): TreeItem;
  enumvisiblechilditems(c: TreeItem, n: number): TreeItem;
  enumallitems(n: number): TreeItem;
  getitemrectx(item: TreeItem): number;
  getitemrecty(item: TreeItem): number;
  getitemrectw(item: TreeItem): number;
  getitemrecth(item: TreeItem): number;
  getitemfrompoint(x: number, y: number): TreeItem;
}

export interface TreeItem extends MakiObject {
  getnumchildren(): number;
  setlabel(label: string): void;
  getlabel(): string;
  ensurevisible(): void;
  getnthchild(nth: number): TreeItem;
  getchild(): TreeItem;
  getchildsibling(_item: TreeItem): TreeItem;
  getsibling(): TreeItem;
  getparent(): TreeItem;
  editlabel(): void;
  hassubitems(): number;
  setsorted(issorted: number): void;
  setchildtab(haschildtab: number): void;
  issorted(): number;
  iscollapsed(): number;
  isexpanded(): number;
  invalidate(): void;
  isselected(): number;
  ishilited(): number;
  sethilited(ishilited: number): void;
  collapse(): number;
  expand(): number;
  gettree(): GuiTree;
  ontreeadd(): void;
  ontreeremove(): void;
  onselect(): void;
  ondeselect(): void;
  onleftdoubleclick(): number;
  onrightdoubleclick(): number;
  onchar(key: number): number;
  onexpand(): void;
  oncollapse(): void;
  onbeginlabeledit(): number;
  onendlabeledit(newlabel: string): number;
  oncontextmenu(x: number, y: number): number;
}

export interface MenuButton extends GuiObject {
  onopenmenu(): void;
  onclosemenu(): void;
  onselectitem(item: string): void;
  openmenu(): void;
  closemenu(): void;
}

export interface CheckBox extends GuiObject {
  ontoggle(newstate: number): void;
  setchecked(checked: number): void;
  ischecked(): number;
  settext(txt: string): void;
  gettext(): string;
}

export interface Form extends GuiObject {
  getcontentsheight(): number;
  newcell(groupname: string): void;
  nextrow(): void;
  deleteall(): void;
}

export interface Frame extends GuiObject {
  getposition(): number;
  setposition(position: number): void;
  onsetposition(position: number): void;
}

export interface Menu extends GuiObject {
  setmenugroup(groupId: string): void;
  getmenugroup(): string;
  setmenu(menuId: string): void;
  getmenu(): string;
  spawnmenu(monitor: number): void;
  cancelmenu(): void;
  setnormalid(id: string): void;
  setdownid(id: string): void;
  sethoverid(id: string): void;
  onopenmenu(): void;
  onclosemenu(): void;
  nextmenu(): void;
  previousmenu(): void;
}
