export interface MakiObject {
  getClassName(): string;
  getId(): string;
  onNotify(command: string, param: string, a: number, b: number): number;
}

export interface System extends MakiObject {
  onScriptLoaded(): void;
  onScriptUnloading(): void;
  onQuit(): void;
  onSetXuiParam(param: string, value: string): void;
  onKeyDown(key: string): void;
  onAccelerator(action: string, section: string, key: string): void;
  onCreateLayout(_layout: Layout): void;
  onShowLayout(_layout: Layout): void;
  onHideLayout(_layout: Layout): void;
  onViewPortChanged(width: number, height: number): void;
  onStop(): void;
  onPlay(): void;
  onPause(): void;
  onResume(): void;
  onTitleChange(newtitle: string): void;
  onTitle2Change(newtitle2: string): void;
  onUrlChange(url: string): void;
  onInfoChange(info: string): void;
  onStatusMsg(msg: string): void;
  onEqBandChanged(band: number, newvalue: number): void;
  onEqPreampChanged(newvalue: number): void;
  onEqChanged(newstatus: number): void;
  onEqFreqChanged(isiso: number): void;
  onVolumeChanged(newvol: number): void;
  onSeek(newpos: number): void;
  getContainer(container_id: string): Container;
  newDynamicContainer(container_id: string): Container;
  newGroup(group_id: string): Group;
  newGroupAsLayout(group_id: string): Layout;
  getNumContainers(): number;
  enumContainer(num: number): Container;
  enumEmbedGUID(num: number): string;
  getWac(wac_guid: string): Wac;
  messageBox(
    message: string,
    msgtitle: string,
    flag: number,
    notanymore_id: string
  ): number;
  getPlayItemString(): string;
  getPlayItemLength(): number;
  getPlayItemMetaDataString(metadataname: string): string;
  getMetaDataString(filename: string, metadataname: string): string;
  getPlayItemDisplayTitle(): string;
  getCurrentTrackRating(): number;
  onCurrentTrackRated(rating: number): void;
  setCurrentTrackRating(rating: number): void;
  getExtFamily(ext: string): string;
  getDecoderName(playitem: string): string;
  playFile(playitem: string): void;
  getAlbumArt(playitem: string): number;
  downloadMedia(
    url: string,
    destinationPath: string,
    wantAddToML: boolean,
    notifyDownloadsList: boolean
  ): void;
  downloadURL(
    url: string,
    destination_filename: string,
    progress_dialog_title: string
  ): void;
  onDownloadFinished(url: string, success: boolean, filename: string): void;
  getDownloadPath(): string;
  setDownloadPath(new_path: string): void;
  enqueueFile(playitem: string): void;
  getLeftVuMeter(): number;
  getRightVuMeter(): number;
  getVolume(): number;
  setVolume(vol: number): void;
  play(): void;
  stop(): void;
  pause(): void;
  next(): void;
  previous(): void;
  eject(): void;
  seekTo(pos: number): void;
  getPosition(): number;
  setEqBand(band: number, value: number): void;
  setEqPreamp(value: number): void;
  setEq(onoff: number): void;
  getEqBand(band: number): number;
  getEqPreamp(): number;
  getEq(): number;
  getMousePosX(): number;
  getMousePosY(): number;
  integerToString(value: number): string;
  StringToInteger(str: string): number;
  floatToString(value: number, ndigits: number): string;
  stringToFloat(str: string): number;
  integerToLongTime(value: number): string;
  integerToTime(value: number): string;
  dateToTime(datetime: number): string;
  dateToLongTime(datetime: number): string;
  formatDate(datetime: number): string;
  formatLongDate(datetime: number): string;
  getDateYear(datetime: number): number;
  getDateMonth(datetime: number): number;
  getDateDay(datetime: number): number;
  getDateDow(datetime: number): number;
  getDateDoy(datetime: number): number;
  getDateHour(datetime: number): number;
  getDateMin(datetime: number): number;
  getDateSec(datetime: number): number;
  getDateDst(datetime: number): number;
  getDate(): number;
  strmid(str: string, start: number, len: number): string;
  strleft(str: string, nchars: number): string;
  strright(str: string, nchars: number): string;
  strsearch(str: string, substr: string): number;
  strlen(str: string): number;
  strupper(str: string): string;
  strlower(str: string): string;
  urlEncode(url: string): string;
  urlDecode(url: string): string;
  parseATF(topass: string): string;
  removePath(str: string): string;
  getPath(str: string): string;
  getExtension(str: string): string;
  getToken(str: string, separator: string, tokennum: number): string;
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
  setPrivateString(section: string, item: string, value: string): void;
  setPrivateInt(section: string, item: string, value: number): void;
  getPrivateString(section: string, item: string, defvalue: string): string;
  getPrivateInt(section: string, item: string, defvalue: number): number;
  setPublicString(item: string, value: string): void;
  setPublicInt(item: string, value: number): void;
  getPublicString(item: string, defvalue: string): string;
  getPublicInt(item: string, defvalue: number): number;
  getParam(): string;
  getScriptGroup(): Group;
  getViewportWidth(): number;
  getViewportWidthFromGuiObject(g: GuiObject): number;
  getViewportWidthFromPoint(x: number, y: number): number;
  getMonitorWidth(): number;
  getMonitorWidthFromPoint(x: number, y: number): number;
  getMonitorWidthFromGuiObject(g: GuiObject): number;
  onMouseMove(x: number, y: number): void;
  getViewportHeight(): number;
  getViewportHeightFromGuiObject(g: GuiObject): number;
  getViewportHeightFromPoint(x: number, y: number): number;
  getMonitorHeight(): number;
  getMonitorHeightFromPoint(x: number, y: number): number;
  getMonitorHeightFromGuiObject(g: GuiObject): number;
  getMonitorLeft(): number;
  getMonitorLeftFromGuiObject(g: GuiObject): number;
  getMonitorLeftFromPoint(x: number, y: number): number;
  getMonitorTop(): number;
  getMonitorTopFromGuiObject(g: GuiObject): number;
  getMonitorTopFromPoint(x: number, y: number): number;
  getViewportLeft(): number;
  getViewportLeftFromGuiObject(g: GuiObject): number;
  getViewportLeftFromPoint(x: number, y: number): number;
  getViewportTop(): number;
  getViewportTopFromGuiObject(g: GuiObject): number;
  getViewportTopFromPoint(x: number, y: number): number;
  debugString(str: string, severity: number): void;
  ddeSend(application: string, command: string, mininterval: number): void;
  onLookForComponent(guid: string): WindowHolder;
  getCurAppLeft(): number;
  getCurAppTop(): number;
  getCurAppWidth(): number;
  getCurAppHeight(): number;
  isAppActive(): boolean;
  getSkinName(): string;
  switchSkin(skinname: string): void;
  isLoadingSkin(): number;
  lockUI(): void;
  unlockUI(): void;
  getMainBrowser(): Browser;
  popMainBrowser(): void;
  navigateUrl(url: string): void;
  navigateUrlBrowser(url: string): void;
  onOpenURL(url: string): boolean;
  isObjectValid(o: MakiObject): boolean;
  integer(d: number): number;
  frac(d: number): number;
  getTimeOfDay(): number;
  setMenuTransparency(alphavalue: number): void;
  onGetCancelComponent(guid: string, goingvisible: boolean): boolean;
  getStatus(): number;
  isKeyDown(vk_code: number): number;
  setClipboardText(_text: string): void;
  Chr(charnum: number): string;
  translate(str: string): string;
  getString(table: string, id: number): string;
  getLanguageId(): string;
  selectFile(extlist: string, id: string, prev_filename: string): string;
  selectFolder(
    wnd_title: string,
    wnd_info: string,
    default_path: string
  ): string;
  systemMenu(): void;
  windowMenu(): void;
  triggerAction(
    context: GuiObject,
    actionname: string,
    actionparam: string
  ): void;
  showWindow(
    guidorgroupid: string,
    preferedcontainer: string,
    transient: boolean
  ): GuiObject;
  hideWindow(hw: GuiObject): void;
  hideNamedWindow(guidorgroup: string): void;
  isNamedWindowVisible(guidorgroup: string): boolean;
  setAtom(atomname: string, object: MakiObject): void;
  getAtom(atomname: string): MakiObject;
  invokeDebugger(): void;
  hasVideoSupport(): number;
  isVideo(): number;
  isVideoFullscreen(): number;
  getIdealVideoWidth(): number;
  getIdealVideoHeight(): number;
  isMinimized(): number;
  minimizeApplication(): void;
  restoreApplication(): void;
  activateApplication(): void;
  getPlaylistLength(): number;
  getPlaylistIndex(): number;
  clearPlaylist(): void;
  isDesktopAlphaAvailable(): boolean;
  isTransparencyAvailable(): boolean;
  onShowNotification(): number;
  getSongInfoText(): string;
  getSongInfoTextTranslated(): string;
  getVisBand(channel: number, band: number): number;
  getRuntimeVersion(): number;
  isWa2ComponentVisible(guid: string): number;
  hideWa2Component(guid: string): void;
  isProVersion(): boolean;
  getWinampVersion(): string;
  getBuildNumber(): number;
  getFileSize(fullfilename: string): number;
}

export interface Container extends MakiObject {
  onSwitchToLayout(newlayout: Layout): void;
  onBeforeSwitchToLayout(oldlayout: Layout, newlayout: Layout): void;
  setXmlParam(param: string, value: string): void;
  onHideLayout(_layout: Layout): void;
  onShowLayout(_layout: Layout): void;
  getLayout(layout_id: string): Layout;
  getNumLayouts(): number;
  enumLayout(num: number): Layout;
  switchToLayout(layout_id: string): void;
  show(): void;
  hide(): void;
  close(): void;
  toggle(): void;
  isDynamic(): number;
  setName(name: string): void;
  getName(): string;
  getGuid(): string;
  getCurLayout(): Layout;
  onAddContent(wnd: GuiObject, id: string, guid: string): void;
}

export interface Wac extends MakiObject {
  getGuid(): string;
  getName(): string;
  sendCommand(
    cmd: string,
    param1: number,
    param2: number,
    param3: string
  ): number;
  show(): void;
  hide(): void;
  isVisible(): boolean;
  onNotify(notifstr: string, a: number, b: number): void;
  onShow(): void;
  onHide(): void;
  setStatusBar(onoff: boolean): void;
  getStatusBar(): boolean;
}

export interface List extends MakiObject {
  addItem(_object: any): void;
  removeItem(pos: number): void;
  enumItem(pos: number): any;
  findItem(_object: any): number;
  findItem2(_object: any, startItem: number): number;
  getNumItems(): number;
  removeAll(): void;
}

export interface BitList extends MakiObject {
  getItem(n: number): boolean;
  setItem(n: number, val: boolean): void;
  setSize(s: number): void;
  getSize(): number;
}

export interface MakiMap extends MakiObject {
  getValue(x: number, y: number): number;
  getARGBValue(x: number, y: number, channel: number): number;
  inRegion(x: number, y: number): boolean;
  loadMap(bitmapid: string): void;
  getWidth(): number;
  getHeight(): number;
  getRegion(): Region;
}

export interface PopupMenu extends MakiObject {
  addSubMenu(submenu: PopupMenu, submenutext: string): void;
  addCommand(
    cmdtxt: string,
    cmd_id: number,
    checked: boolean,
    disabled: boolean
  ): void;
  addSeparator(): void;
  popAtXY(x: number, y: number): number;
  popAtMouse(): number;
  getNumCommands(): number;
  checkCommand(cmd_id: number, check: boolean): void;
  disableCommand(cmd_id: number, disable: boolean): void;
}

export interface Region extends MakiObject {
  add(reg: Region): void;
  sub(reg: Region): void;
  offset(x: number, y: number): void;
  stretch(r: number): void;
  copy(reg: Region): void;
  loadFromMap(regionmap: MakiMap, threshold: number, reversed: boolean): void;
  loadFromBitmap(bitmapid: string): void;
  getBoundingBoxX(): number;
  getBoundingBoxY(): number;
  getBoundingBoxW(): number;
  getBoundingBoxH(): number;
}

export interface Timer extends MakiObject {
  onTimer(): void;
  setDelay(millisec: number): void;
  getDelay(): number;
  start(): void;
  stop(): void;
  isRunning(): boolean;
  getSkipped(): number;
}

export interface FeedWatcher extends MakiObject {
  setFeed(feed_id: string): number;
  releaseFeed(): void;
  onFeedChange(new_feeddata: string): void;
}

export interface GuiObject extends MakiObject {
  show(): void;
  hide(): void;
  isVisible(): number;
  onSetVisible(onoff: boolean): void;
  setAlpha(alpha: number): void;
  getAlpha(): number;
  onLeftButtonUp(x: number, y: number): void;
  onLeftButtonDown(x: number, y: number): void;
  onRightButtonUp(x: number, y: number): void;
  onRightButtonDown(x: number, y: number): void;
  onRightButtonDblClk(x: number, y: number): void;
  onLeftButtonDblClk(x: number, y: number): void;
  onMouseWheelUp(clicked: number, lines: number): number;
  onMouseWheelDown(clicked: number, lines: number): number;
  onMouseMove(x: number, y: number): void;
  onEnterArea(): void;
  onLeaveArea(): void;
  setEnabled(onoff: boolean): void;
  getEnabled(): boolean;
  onEnable(onoff: boolean): void;
  resize(x: number, y: number, w: number, h: number): void;
  onResize(x: number, y: number, w: number, h: number): void;
  isMouseOver(x: number, y: number): boolean;
  getLeft(): number;
  getTop(): number;
  getWidth(): number;
  getHeight(): number;
  setTargetX(x: number): void;
  setTargetY(y: number): void;
  setTargetW(w: number): void;
  setTargetH(r: number): void;
  setTargetA(alpha: number): void;
  setTargetSpeed(insecond: number): void;
  gotoTarget(): void;
  onTargetReached(): void;
  cancelTarget(): void;
  reverseTarget(reverse: number): void;
  onStartup(): void;
  isGoingToTarget(): boolean;
  setXmlParam(param: string, value: string): void;
  getXmlParam(param: string): string;
  init(parent: Group): void;
  bringToFront(): void;
  bringToBack(): void;
  bringAbove(guiobj: GuiObject): void;
  bringBelow(guiobj: GuiObject): void;
  getGuiX(): number;
  getGuiY(): number;
  getGuiW(): number;
  getGuiH(): number;
  getGuiRelatX(): number;
  getGuiRelatY(): number;
  getGuiRelatW(): number;
  getGuiRelatH(): number;
  isActive(): boolean;
  getParent(): GuiObject;
  getParentLayout(): Layout;
  getTopParent(): GuiObject;
  runModal(): number;
  endModal(retcode: number): void;
  findObject(id: string): GuiObject;
  findObjectXY(x: number, y: number): GuiObject;
  getName(): string;
  clientToScreenX(x: number): number;
  clientToScreenY(y: number): number;
  clientToScreenW(w: number): number;
  clientToScreenH(h: number): number;
  screenToClientX(x: number): number;
  screenToClientY(y: number): number;
  screenToClientW(w: number): number;
  screenToClientH(h: number): number;
  getAutoWidth(): number;
  getAutoHeight(): number;
  setFocus(): void;
  onChar(c: string): void;
  onAccelerator(accel: string): void;
  isMouseOverRect(): boolean;
  getInterface(interface_guid: string): MakiObject;
  onDragEnter(): void;
  onDragOver(x: number, y: number): void;
  onDragLeave(): void;
  onKeyDown(vk_code: number): void;
  onKeyUp(vk_code: number): void;
  onGetFocus(): void;
  onKillFocus(): void;
  sendAction(
    action: string,
    param: string,
    x: number,
    y: number,
    p1: number,
    p2: number
  ): number;
  onAction(
    action: string,
    param: string,
    x: number,
    y: number,
    p1: number,
    p2: number,
    source: GuiObject
  ): number;
}

export interface Group extends GuiObject {
  getObject(object_id: string): GuiObject;
  getNumObjects(): number;
  enumObject(num: number): GuiObject;
  onCreateObject(newobj: GuiObject): void;
  getMousePosX(): number;
  getMousePosY(): number;
  isLayout(): boolean;
}

export interface Layout extends Group {
  onDock(side: number): void;
  onUndock(): void;
  onScale(newscalevalue: number): void;
  getScale(): number;
  setScale(scalevalue: number): void;
  setDesktopAlpha(onoff: boolean): void;
  getDesktopAlpha(): boolean;
  getContainer(): Container;
  center(): void;
  onMove(): void;
  onEndMove(): void;
  onUserResize(x: number, y: number, w: number, h: number): void;
  snapAdjust(left: number, top: number, right: number, bottom: number): void;
  getSnapAdjustTop(): number;
  getSnapAdjustRight(): number;
  getSnapAdjustLeft(): number;
  getSnapAdjustBottom(): number;
  setRedrawOnResize(wantredrawonresize: number): void;
  beforeRedock(): void;
  redock(): void;
  isTransparencySafe(): boolean;
  isLayoutAnimationSafe(): boolean;
  onMouseEnterLayout(): void;
  onMouseLeaveLayout(): void;
  onSnapAdjustChanged(): void;
}

export interface WindowHolder extends GuiObject {
  setRegionFromMap(
    regionmap: MakiMap,
    threshold: number,
    reverse: boolean
  ): void;
  setRegion(reg: Region): void;
  getContent(): GuiObject;
  getGuid(): string;
  getComponentName(): string;
  onGetWac(wacobj: Wac): void;
  onGiveUpWac(wacobj: Wac): void;
  getWac(): Wac;
  setAcceptWac(onoff: boolean): void;
}

export interface ComponentBucket extends GuiObject {
  getMaxHeight(): number;
  getMaxWidth(): number;
  setScroll(x: number): number;
  getScroll(): number;
  getNumChildren(): number;
  enumChildren(n: number): GuiObject;
}

export interface Edit extends GuiObject {
  onEnter(): void;
  onAbort(): void;
  onIdleEditUpdate(): void;
  onEditUpdate(): void;
  setText(txt: string): void;
  setAutoEnter(onoff: boolean): void;
  getAutoEnter(): number;
  getText(): string;
  selectAll(): void;
  enter(): void;
  setIdleEnabled(onoff: boolean): void;
  getIdleEnabled(): number;
}

export interface Slider extends GuiObject {
  onSetPosition(newpos: number): void;
  onPostedPosition(newpos: number): void;
  onSetFinalPosition(pos: number): void;
  setPosition(pos: number): void;
  getPosition(): number;
  lock(): void;
  unlock(): void;
}

export interface Vis extends GuiObject {
  onFrame(): void;
  setRealtime(onoff: boolean): void;
  getRealtime(): boolean;
  getMode(): number;
  setMode(mode: number): void;
  nextMode(): void;
}

export interface Browser extends GuiObject {
  navigateUrl(url: string): void;
  back(): void;
  forward(): void;
  stop(): void;
  refresh(): void;
  home(): void;
  setTargetName(targetname: string): void;
  onBeforeNavigate(
    url: string,
    flags: number,
    targetframename: string
  ): boolean;
  onDocumentComplete(url: string): void;
  onDocumentReady(url: string): void;
  getDocumentTitle(): string;
  onNavigateError(url: string, code: number): void;
  setCancelIEErrorPage(cancel: boolean): void;
  scrape(): void;
  onMediaLink(url: string): string;
}

export interface EqVis extends GuiObject {}

export interface Status extends GuiObject {}

export interface Text extends GuiObject {
  setText(txt: string): void;
  setAlternateText(txt: string): void;
  getText(): string;
  getTextWidth(): number;
  onTextChanged(newtxt: string): void;
}

export interface Title extends GuiObject {}

export interface Layer extends GuiObject {
  onBeginResize(x: number, y: number, w: number, h: number): void;
  onEndResize(x: number, y: number, w: number, h: number): void;
  fx_onInit(): void;
  fx_onFrame(): void;
  fx_onGetPixelR(r: number, d: number, x: number, y: number): number;
  fx_onGetPixelD(r: number, d: number, x: number, y: number): number;
  fx_onGetPixelX(r: number, d: number, x: number, y: number): number;
  fx_onGetPixelY(r: number, d: number, x: number, y: number): number;
  fx_onGetPixelA(r: number, d: number, x: number, y: number): number;
  setRegionFromMap(
    regionmap: MakiMap,
    threshold: number,
    reverse: boolean
  ): void;
  setRegion(reg: Region): void;
  fx_setEnabled(onoff: boolean): void;
  fx_getEnabled(): boolean;
  fx_setWrap(onoff: boolean): void;
  fx_getWrap(): boolean;
  fx_setRect(onoff: boolean): void;
  fx_getRect(): boolean;
  fx_setBgFx(onoff: boolean): void;
  fx_getBgFx(): boolean;
  fx_setClear(onoff: boolean): void;
  fx_getClear(): boolean;
  fx_setSpeed(msperframe: number): void;
  fx_getSpeed(): number;
  fx_setRealtime(onoff: boolean): void;
  fx_getRealtime(): boolean;
  fx_setLocalized(onoff: boolean): void;
  fx_getLocalized(): boolean;
  fx_setBilinear(onoff: boolean): void;
  fx_getBilinear(): boolean;
  fx_setAlphaMode(onoff: boolean): void;
  fx_getAlphaMode(): boolean;
  fx_setGridSize(x: number, y: number): void;
  fx_update(): void;
  fx_restart(): void;
  isInvalid(): boolean;
}

export interface Button extends GuiObject {
  onActivate(activated: number): void;
  onLeftClick(): void;
  onRightClick(): void;
  setActivated(onoff: boolean): void;
  setActivatedNoCallback(onoff: boolean): void;
  getActivated(): boolean;
  leftClick(): void;
  rightClick(): void;
}

export interface AnimatedLayer extends Layer {
  onPlay(): void;
  onPause(): void;
  onResume(): void;
  onStop(): void;
  onFrame(framenum: number): void;
  setSpeed(msperframe: number): void;
  gotoFrame(framenum: number): void;
  setStartFrame(framenum: number): void;
  setEndFrame(framenum: number): void;
  setAutoReplay(onoff: boolean): void;
  play(): void;
  stop(): void;
  pause(): void;
  isPlaying(): boolean;
  isPaused(): boolean;
  isStopped(): boolean;
  getStartFrame(): number;
  getEndFrame(): number;
  getLength(): number;
  getDirection(): number;
  getAutoReplay(): boolean;
  getCurFrame(): number;
  setRealtime(onoff: boolean): void;
}

export interface AlbumArtLayer extends Layer {
  refresh(): void;
  isLoading(): void;
  onAlbumArtLoaded(success: boolean): void;
}

export interface ToggleButton extends Button {
  onToggle(onoff: boolean): void;
  getCurCfgVal(): number;
}

export interface GroupList extends GuiObject {
  instantiate(group_id: string, num_groups: number): Group;
  getNumItems(): number;
  enumItem(num: number): Group;
  removeAll(): void;
  scrollToPercent(percent: number): void;
  setRedraw(redraw: number): void;
}

export interface CfgGroup extends Group {
  cfgGetInt(): number;
  cfgSetInt(intvalue: number): void;
  cfgGetString(): string;
  cfgGetFloat(): number;
  cfgSetFloat(floatvalue: number): void;
  cfgSetString(strvalue: string): void;
  onCfgChanged(): void;
  cfgGetGuid(): string;
  cfgGetName(): string;
}

export interface QueryList extends GuiObject {
  onResetQuery(): void;
}

export interface MouseRedir extends GuiObject {
  setRedirection(o: GuiObject): void;
  getRedirection(): GuiObject;
  setRegionFromMap(
    regionmap: MakiMap,
    threshold: number,
    reverse: boolean
  ): void;
  setRegion(reg: Region): void;
}

export interface DropDownList extends GuiObject {
  getItemSelected(): string;
  onSelect(id: number, hover: number): void;
  setListHeight(h: number): void;
  openList(): void;
  closeList(): void;
  setItems(lotsofitems: string): void;
  addItem(_text: string): number;
  delItem(id: number): void;
  findItem(_text: string): number;
  getNumItems(): number;
  selectItem(id: number, hover: number): void;
  getItemText(id: number): string;
  getSelected(): number;
  getSelectedText(): string;
  getCustomText(): string;
  deleteAllItems(): void;
  setNoItemText(txt: string): void;
}

export interface LayoutStatus extends GuiObject {
  callme(str: string): void;
}

export interface TabSheet extends GuiObject {
  getCurPage(): number;
  setCurPage(a: number): void;
}

export interface GuiList extends GuiObject {
  addColumn(name: string, width: number, numeric: number): number;
  getNumColumns(): number;
  getColumnWidth(column: number): number;
  setColumnWidth(column: number, newwidth: number): void;
  getColumnLabel(column: number): string;
  setColumnLabel(column: number, newlabel: string): void;
  getColumnNumeric(column: number): number;
  setColumnDynamic(column: number, isdynamic: number): void;
  isColumnDynamic(column: number): number;
  invalidateColumns(): void;
  getNumItems(): number;
  getItemCount(): number;
  addItem(label: string): number;
  insertItem(pos: number, label: string): number;
  getLastAddedItemPos(): number;
  setSubItem(pos: number, subpos: number, txt: string): void;
  deleteAllItems(): void;
  deleteByPos(pos: number): number;
  getItemLabel(pos: number, subpos: number): string;
  getSubitemText(pos: number, subpos: number): string;
  setItemLabel(pos: number, _text: string): void;
  invalidateItem(pos: number): number;
  getFirstItemVisible(): number;
  getLastItemVisible(): number;
  setItemIcon(pos: number, bitmapId: string): void;
  getItemIcon(pos: number): string;
  setMinimumSize(size: number): void;
  getWantAutoDeselect(): number;
  setWantAutoDeselect(want: number): void;
  onSetVisible(show: number): void;
  setAutoSort(dosort: number): void;
  setFontSize(size: number): number;
  getFontSize(): number;
  getHeaderHeight(): number;
  getPreventMultipleSelection(): number;
  setPreventMultipleSelection(val: number): number;
  setShowIcons(showThem: number): void;
  getShowIcons(): number;
  setIconWidth(width: number): number;
  setIconHeight(width: number): number;
  getIconWidth(): void;
  getIconHeight(): void;
  next(): void;
  previous(): void;
  pagedown(): void;
  pageup(): void;
  home(): void;
  end(): void;
  reset(): void;
  ensureItemVisible(pos: number): void;
  scrollAbsolute(x: number): number;
  scrollRelative(x: number): number;
  scrollLeft(lines: number): void;
  scrollRight(lines: number): void;
  scrollUp(lines: number): void;
  scrollDown(lines: number): void;
  jumpToNext(c: number): void;
  scrollToItem(pos: number): void;
  selectCurrent(): void;
  selectFirstEntry(): void;
  getItemSelected(pos: number): number;
  isItemFocused(pos: number): number;
  getItemFocused(): number;
  setItemFocused(pos: number): void;
  getFirstItemSelected(): number;
  getNextItemSelected(lastpos: number): number;
  selectAll(): number;
  deselectAll(): number;
  invertSelection(): number;
  setSelectionStart(pos: number): void;
  setSelectionEnd(pos: number): void;
  setSelected(pos: number, selected: number): void;
  toggleSelection(pos: number, setfocus: number): void;
  resort(): void;
  getSortDirection(): number;
  getSortColumn(): number;
  setSortColumn(col: number): void;
  setSortDirection(dir: number): void;
  moveItem(from: number, to: number): void;
  onSelectAll(): void;
  onDelete(): void;
  onDoubleClick(itemnum: number): void;
  onLeftClick(itemnum: number): void;
  onSecondLeftClick(itemnum: number): void;
  onRightClick(itemnum: number): number;
  onColumnDblClick(col: number, x: number, y: number): number;
  onColumnLabelClick(col: number, x: number, y: number): number;
  onItemSelection(itemnum: number, selected: number): void;
  onIconLeftClick(itemnum: number, x: number, y: number): number;
}

export interface GuiTree extends GuiObject {
  onWantAutoContextMenu(): number;
  onMouseWheelUp(clicked: number, lines: number): number;
  onMouseWheelDown(clicked: number, lines: number): number;
  onContextMenu(x: number, y: number): number;
  onChar(c: number): number;
  onItemRecvDrop(item: TreeItem): void;
  onLabelChange(item: TreeItem): void;
  onItemSelected(item: TreeItem): void;
  onItemDeselected(item: TreeItem): void;
  getNumRootItems(): number;
  enumRootItem(which: number): TreeItem;
  jumpToNext(c: number): void;
  ensureItemVisible(item: TreeItem): void;
  getContentsWidth(): number;
  getContentsHeight(): number;
  addTreeItem(
    item: TreeItem,
    par: TreeItem,
    sorted: number,
    haschildtab: number
  ): TreeItem;
  removeTreeItem(item: TreeItem): number;
  moveTreeItem(item: TreeItem, newparent: TreeItem): void;
  deleteAllItems(): void;
  expandItem(item: TreeItem): number;
  expandItemDeferred(item: TreeItem): void;
  collapseItem(item: TreeItem): number;
  collapseItemDeferred(item: TreeItem): void;
  selectItem(item: TreeItem): void;
  selectItemDeferred(item: TreeItem): void;
  delItemDeferred(item: TreeItem): void;
  hiliteItem(item: TreeItem): void;
  unhiliteItem(item: TreeItem): void;
  getCurItem(): TreeItem;
  hitTest(x: number, y: number): TreeItem;
  editItemLabel(item: TreeItem): void;
  cancelEditLabel(destroyit: number): void;
  setAutoEdit(ae: number): void;
  getAutoEdit(): number;
  getByLabel(item: TreeItem, name: string): TreeItem;
  setSorted(dosort: number): void;
  getSorted(): number;
  sortTreeItems(): void;
  getSibling(item: TreeItem): TreeItem;
  setAutoCollapse(doautocollapse: number): void;
  setFontSize(newsize: number): number;
  getFontSize(): number;
  getNumVisibleChildItems(c: TreeItem): number;
  getNumVisibleItems(): number;
  enumVisibleItems(n: number): TreeItem;
  enumVisibleChildItems(c: TreeItem, n: number): TreeItem;
  enumAllItems(n: number): TreeItem;
  getItemRectX(item: TreeItem): number;
  getItemRectY(item: TreeItem): number;
  getItemRectW(item: TreeItem): number;
  getItemRectH(item: TreeItem): number;
  getItemFromPoint(x: number, y: number): TreeItem;
}

export interface TreeItem extends MakiObject {
  getNumChildren(): number;
  setLabel(label: string): void;
  getLabel(): string;
  ensureVisible(): void;
  getNthChild(nth: number): TreeItem;
  getChild(): TreeItem;
  getChildSibling(_item: TreeItem): TreeItem;
  getSibling(): TreeItem;
  getParent(): TreeItem;
  editLabel(): void;
  hasSubItems(): number;
  setSorted(issorted: number): void;
  setChildTab(haschildtab: number): void;
  isSorted(): number;
  isCollapsed(): number;
  isExpanded(): number;
  invalidate(): void;
  isSelected(): number;
  isHilited(): number;
  setHilited(ishilited: number): void;
  collapse(): number;
  expand(): number;
  getTree(): GuiTree;
  onTreeAdd(): void;
  onTreeRemove(): void;
  onSelect(): void;
  onDeselect(): void;
  onLeftDoubleClick(): number;
  onRightDoubleClick(): number;
  onChar(key: number): number;
  onExpand(): void;
  onCollapse(): void;
  onBeginLabelEdit(): number;
  onEndLabelEdit(newlabel: string): number;
  onContextMenu(x: number, y: number): number;
}

export interface MenuButton extends GuiObject {
  onOpenMenu(): void;
  onCloseMenu(): void;
  onSelectItem(item: string): void;
  openMenu(): void;
  closeMenu(): void;
}

export interface CheckBox extends GuiObject {
  onToggle(newstate: number): void;
  setChecked(checked: number): void;
  isChecked(): number;
  setText(txt: string): void;
  getText(): string;
}

export interface Form extends GuiObject {
  getContentsHeight(): number;
  newCell(groupname: string): void;
  nextRow(): void;
  deleteAll(): void;
}

export interface Frame extends GuiObject {
  getPosition(): number;
  setPosition(position: number): void;
  onSetPosition(position: number): void;
}

export interface Menu extends GuiObject {
  setMenuGroup(groupId: string): void;
  getMenuGroup(): string;
  setMenu(menuId: string): void;
  getMenu(): string;
  spawnMenu(monitor: number): void;
  cancelMenu(): void;
  setNormalId(id: string): void;
  setDownId(id: string): void;
  setHoverId(id: string): void;
  onOpenMenu(): void;
  onCloseMenu(): void;
  nextMenu(): void;
  previousMenu(): void;
}
