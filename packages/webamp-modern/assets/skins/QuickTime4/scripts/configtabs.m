#include <lib/std.mi>
#include "attribs.m"

function setTabs(int tabstate);
function setTabContent(int contentstate);

function OpenDrawer(int animate);
function CloseDrawer(int animate);
function updateAttribs();

function ShowDrawer();
function adjustSnapPoints(int DrawerOpen);

function openVideoAvs(int open);
Function WindowHolder getVideoWindowHolder();
Function WindowHolder getVisWindowHolder();
Function drawer_hideVis();
Function drawer_showVis();
Function drawer_hideVideo();
Function drawer_showVideo();

Global Group frameGroup,PlayerMain,VideoVisGroup;
Global Group tabs,tEQon,tEQoff,tOPTIONSon,tOPTIONSoff,tCOLORTHEMESon,tCOLORTHEMESoff;
Global Group ContentEQ,ContentOPTIONS,ContentCOLORTHEMES;
Global Layer mouseLayerEQ,mouseLayerOPTIONS,mouseLayerCOLORTHEMES;
Global Button btnClose,btnOpen;
Global Group Drawer,DrawerShadow,DrawerContent;
Global GuiObject ColorThemes;
Global Layout main;
Global Int mychange;
Global Boolean loaded=0;
Global Timer deferred_opendrawer;

Global Int minMainH, vidvisH, titlebarH, drawerOpenH, videoavsOpened;
Global Button btnAvsOpen, btnVideoOpen;

System.onScriptLoaded() {
	initAttribs();
	minMainH = 123;
	vidvisH = 0;
	titlebarH = 20;
	drawerOpenH = 172;
	videoavsOpened = 0; // 1=video opened, 2=avs opened, 0 = no one.

	frameGroup = getScriptGroup();
	main = frameGroup.getParentLayout();

	tabs=frameGroup.findObject("config.tabs");
	tEQon=frameGroup.findObject("config.tab.eq.on");
	tEQoff=frameGroup.findObject("config.tab.eq.off");
	tOPTIONSon=frameGroup.findObject("config.tab.options.on");
	tOPTIONSoff=frameGroup.findObject("config.tab.options.off");
	tCOLORTHEMESon=frameGroup.findObject("config.tab.colorthemes.on");
	tCOLORTHEMESoff=frameGroup.findObject("config.tab.colorthemes.off");

	ColorThemes=frameGroup.findObject("colorthemes");
	PlayerMain=frameGroup.findObject("player.main");
	VideoVisGroup = frameGroup.findObject("AVSGroup");

	ContentEQ=frameGroup.findObject("player.normal.drawer.eq");
	ContentOPTIONS=frameGroup.findObject("player.normal.drawer.options");
	ContentCOLORTHEMES=frameGroup.findObject("player.normal.drawer.colorthemes");

	mouseLayerEQ=frameGroup.findObject("mousetrapTabEQ");
	mouseLayerOPTIONS=frameGroup.findObject("mousetrapTabOPTIONS");
	mouseLayerCOLORTHEMES=frameGroup.findObject("mousetrapTabCOLORTHEMES");

	btnClose = frameGroup.findObject("drawer.button.close");
	btnOpen = frameGroup.findObject("drawer.button.open");
	drawer = frameGroup.findObject("player.normal.drawer");
	DrawerShadow = frameGroup.findObject("player.normal.drawer.shadow");
	DrawerContent = frameGroup.findObject("player.normal.drawer.content");

	btnAvsOpen = frameGroup.findObject("avs.toggle");
	btnVideoOpen = frameGroup.findObject("video.toggle");

	int tabEQwidth=tEQon.getWidth();
	int tabOPTIONSwidth=tOPTIONSon.getWidth();

	int tOPTIONSx=tabEQwidth-3;
	int tCOLORTHEMESx=tabEQwidth+tabOPTIONSwidth-6;

	tOPTIONSon.setXmlParam("x",integertostring(tOPTIONSx));
	tOPTIONSoff.setXmlParam("x",integertostring(tOPTIONSx));
	tCOLORTHEMESoff.setXmlParam("x",integertostring(tCOLORTHEMESx));
	tCOLORTHEMESon.setXmlParam("x",integertostring(tCOLORTHEMESx));

	mychange = 1;
	setTabs(getPrivateInt("winamp5", "ConfigTab", 1));
	mychange = 0;
	if (getPrivateInt("winamp5", "DrawerOpen", 0)) {
		OpenDrawer(0);
		adjustSnapPoints(1);
	} else {
		adjustSnapPoints(0);
	}
	loaded=1;
	deferred_opendrawer = new Timer;
	deferred_opendrawer.setDelay(250); 
}

System.onScriptUnloading() {
	delete deferred_opendrawer;
}

setTabs(int tabstate) {

	tEQon.hide();
	tOPTIONSon.hide();
	tCOLORTHEMESon.hide();

	if (tabstate==1) {
		tEQon.show();
	}
	if (tabstate==2) {
		tOPTIONSon.show();
	}
	if (tabstate==3) {
		tCOLORTHEMESon.show();
	}

	setTabContent(tabstate);
	setPrivateInt("winamp5", "ConfigTab", tabstate);
	updateAttribs();
}

setTabContent(int contentstate) {
	if (contentstate==1) {
		ContentEQ.show();
		ContentOPTIONS.hide();
		ContentCOLORTHEMES.hide();
	}
	if (contentstate==2) {
		ContentEQ.hide();
		ContentOPTIONS.show();
		ContentCOLORTHEMES.hide();
	}
	if (contentstate==3) {
		ContentEQ.hide();
		ContentOPTIONS.hide();
		ContentCOLORTHEMES.show();
	}
}

mouseLayerEQ.onLeftButtonDown(int x, int y) {
	setTabs(1);
}

mouseLayerOPTIONS.onLeftButtonDown(int x, int y) {
	setTabs(2);
}

mouseLayerCOLORTHEMES.onLeftButtonDown(int x, int y) {
	setTabs(3);
}

OpenDrawer(int animate) {
	btnOpen.hide();
	btnClose.show();
	main.beforeRedock();
	if (animate && scrollconfigdrawerattrib.getData() == "1") {
		lockUI();
		// drawer.setTargetY(-194);
		// drawer.setTargetX(drawer.getGuiX());
		// drawer.setTargetW(drawer.getGuiW());
		// drawer.setTargetH(drawer.getGuiH());
		// drawer.setTargetSpeed(1);
		// drawer.gotoTarget();

		// main.setTargetH(titlebarH + vidvisH + drawerOpenH);
		// main.setTargetY(main.getGuiY());
		// main.setTargetX(main.getGuiX());
		// main.setTargetW(main.getGuiW());
		// main.setTargetSpeed(1);
		// main.gotoTarget();
		main.setXMLParam("h",integertostring(titlebarH + vidvisH + drawerOpenH));

		//sadly the animation cant be async. :(
		// DrawerContent.setTargetY(65);
		// DrawerContent.setTargetX(DrawerContent.getGuiX());
		// DrawerContent.setTargetW(DrawerContent.getGuiW());
		// DrawerContent.setTargetH(DrawerContent.getGuiH());
		// DrawerContent.setTargetSpeed(1);

		// DrawerContent.gotoTarget();
		// DrawerContent.setXMLParam("y","65");
		DrawerContent.setXMLParam("y","65");
		DrawerContent.setXMLParam("alpha","255");

	} else {
		// drawer.setXMLParam("y","-194");
		main.setXMLParam("h",integertostring(titlebarH + vidvisH + drawerOpenH));
		DrawerContent.setXMLParam("y","65");
		DrawerContent.setXMLParam("alpha","255");

		setPrivateInt("winamp5", "DrawerOpen", 1);
		ColorThemes.show();
		adjustSnapPoints(1);
		updateAttribs();
		main.Redock();
	}
	DrawerShadow.show();
//	main.setXmlParam("minimum_h", "397");
}

closeDrawer(int animate) {
	main.beforeRedock();
//	main.setXmlParam("minimum_h", "280");
	ColorThemes.hide();
	// DrawerContent.hide();
	DrawerContent.setXMLParam("alpha","0");
	DrawerContent.setXMLParam("y","0");

	btnClose.hide();
	btnOpen.show();
	if (animate && scrollconfigdrawerattrib.getData() == "1") {
		lockUI();
		// drawer.setTargetY(-263);
		// drawer.setTargetX(drawer.getGuiX());
		// drawer.setTargetW(drawer.getGuiW());
		// drawer.setTargetH(drawer.getGuiH());
		// drawer.setTargetSpeed(1);
		// drawer.gotoTarget();

		//? ANIMATING LAYOUT IS SUCK
		// main.setTargetH(titlebarH + vidvisH);
		// main.setTargetY(main.getGuiY());
		// main.setTargetX(main.getGuiX());
		// main.setTargetW(main.getGuiW());
		// main.setTargetSpeed(1);
		// main.gotoTarget();
		main.setXMLParam("h",integertostring(titlebarH + vidvisH));

		// DrawerContent.setTargetY(65);
		// DrawerContent.setTargetX(drawer.getGuiX());
		// DrawerContent.setTargetW(drawer.getGuiW());
		// DrawerContent.setTargetH(drawer.getGuiH());
		// DrawerContent.setTargetSpeed(1);
		// DrawerContent.gotoTarget();

	} else {
		// drawer.setXMLParam("y","-263");
		main.setXMLParam("h",integertostring(titlebarH + vidvisH));

		DrawerShadow.hide();
		setPrivateInt("winamp5", "DrawerOpen", 0);
		adjustSnapPoints(0);
		updateAttribs();
		main.redock();
	}
}

btnClose.onLeftClick() {
	closeDrawer(1);
}

btnOpen.onLeftClick() {
	openDrawer(1);
}

drawer.onTargetReached() {
	if (btnClose.isVisible()) {
		setPrivateInt("winamp5", "DrawerOpen", 1);
		ColorThemes.show();
		adjustSnapPoints(1);
	} else {
		DrawerShadow.hide();
		setPrivateInt("winamp5", "DrawerOpen", 0);
		adjustSnapPoints(0);
	}
	updateAttribs();
	main.redock();
	unlockUI();
}

ShowDrawer() {
	drawer.setXmlParam("y", "-147");
	ColorThemes.show();
	btnOpen.hide();
	btnClose.show();
	DrawerShadow.show();
	adjustSnapPoints(1);
}

adjustSnapPoints(int DrawerOpen) {
	int menuHeight=0;
	if (menubar_main_attrib.getData() == "0") menuHeight=17;
	if (DrawerOpen) {
		main.snapAdjust(0,0,0,0+menuHeight);
	} else {
		main.snapAdjust(0,0,0,116+menuHeight);
	}
}

menubar_main_attrib.onDataChanged() {
	int menuHeight=0;
	if (getData() == "0") menuHeight=17;
	main.beforeRedock();
	int DrawerOpen=getPrivateInt("winamp5", "DrawerOpen", 0);
	if (DrawerOpen) {
		main.snapAdjust(0,0,0,0+menuHeight);
	} else {
		main.snapAdjust(0,0,0,116+menuHeight);
	}
	main.Redock();
}

main.onResize(int x, int y, int w, int h) {
	int newXpos=w/2-163;
	DrawerContent.setXmlParam("x",integertostring(newXpos));
}

eq_visible_attrib.onDataChanged() {
  if (mychange) return;
  mychange = 1;
  if (getData() == "1") {
	main.getContainer().switchToLayout("normal"); // instead of main.show(), or linkwidth wont work
	deferred_opendrawer.start();
  } if (getData() == "0") {
	closeDrawer(1);
  }
  mychange = 0;
}

deferred_opendrawer.onTimer() {
	stop();
  	setTabs(1);
  	if (btnOpen.isVisible()) openDrawer(1);
}

updateAttribs() {
  if (mychange) return;
  mychange = 1;
  if (tabstate == 1 && !btnOpen.isVisible()) eq_visible_attrib.setData("1"); else eq_visible_attrib.setData("0");
  mychange = 0;
}

System.onKeyDown(String key) {
  if (key == "alt+g") {
    if (eq_visible_attrib.getData() == "0")
        eq_visible_attrib.setData("1");
    else
        eq_visible_attrib.setData("0");
    complete;
  }
}

// Show or Hide the Video/AVS area
openVideoAvs(int open){
	if(open == 1){
		VideoVisGroup.show();
		vidvisH = 244;
	}
	else {
		VideoVisGroup.hide();
		vidvisH = 0;
	}
	main.setXMLParam("h",integertostring(titlebarH + vidvisH + drawerOpenH));
}

btnAvsOpen.onLeftClick() {
	if(videoavsOpened == 2) { // avs is already opened
		drawer_hideVis();
		openVideoAvs(0);
		videoavsOpened = 0;
	} 
	else if(videoavsOpened == 1) { // video is already opened
		drawer_hideVideo();
		drawer_showVis();
		videoavsOpened = 2;
	} 
	else {
		openVideoAvs(1);
		drawer_showVis();
		videoavsOpened = 2;
	}
}

WindowHolder getVisWindowHolder() {
    WindowHolder wh = getScriptGroup().findObject("myviswnd");
    return wh; // we return our vis windowholder object
}

WindowHolder getVideoWindowHolder() {
    WindowHolder wh = getScriptGroup().findObject("myvideownd");
    return wh; // we return our video windowholder object
}

// -----------------------------------------------------------------------
drawer_showVis() {
// #ifdef DEBUG
//     DebugString("drawer_showVis",0 );
// #endif
//     __showing_vis = 1;
//     setPrivateInt("winamp5", __myname+"OpenState", OPEN);
//     setPrivateInt("winamp5", __myname+"State", CONTENT_VIS);
    GuiObject o = getVisWindowHolder();
    if (o != NULL) { 
		// __bypasscancel = 1; 
		o.show(); 
		// __bypasscancel = 0; 
	}
// #ifdef DEBUG
//     else DebugString("vis object not provided (show)", 0);
// #endif
//     onShowVis();
//     __showing_vis = 0;
}

// -----------------------------------------------------------------------
drawer_hideVis() {
//     __callback_vis_show = 0;
// #ifdef DEBUG
//     DebugString("drawer_hideVis",0 );
// #endif
//     __hiding_vis = 1;
    GuiObject o = getVisWindowHolder();
    if (o != NULL) { 
		// __bypasscancel = 1; 
		o.hide(); 
		// __bypasscancel = 0; 
	}
// #ifdef DEBUG
//     else DebugString("video object not found (hide)", 0);
// #endif
//     onHideVis();
//     __hiding_vis = 0;
}

// -----------------------------------------------------------------------
drawer_showVideo() {
// #ifdef DEBUG
//     DebugString("drawer_showVideo",0 );
// #endif
//     __showing_video = 1;
//     setPrivateInt("winamp5", __myname+"OpenState", OPEN);
//     setPrivateInt("winamp5", __myname+"State", CONTENT_VIDEO);
    GuiObject o = getVideoWindowHolder();
    if (o != NULL) { 
		// __bypasscancel = 1; 
		o.show(); 
		// __bypasscancel = 0; 
	}
// #ifdef DEBUG
//     else DebugString("vis object not found (show)", 0);
// #endif
//     onShowVideo();
//     __showing_video = 0;
}

// -----------------------------------------------------------------------
drawer_hideVideo() {
//     __callback_video_show = 0;
// #ifdef DEBUG
//     DebugString("drawer_hideVideo",0 );
// #endif
//     __hiding_video = 1;
    GuiObject o = getVideoWindowHolder();
    if (o != NULL) { 
		// __bypasscancel = 1; 
		o.hide(); 
		// __bypasscancel = 0; 
	}
// #ifdef DEBUG
//     else DebugString("video object not found (hide)", 0);
// #endif
//     onHideVideo();
//     __hiding_video = 0;
}