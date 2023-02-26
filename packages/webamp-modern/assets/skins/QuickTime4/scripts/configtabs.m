#include <lib/std.mi>
#include "attribs.m"

function setTabs(int tabstate);
function setTabContent(int contentstate);

function OpenDrawer(int animate);
function CloseDrawer(int animate);
function updateAttribs();

function ShowDrawer();
function adjustSnapPoints(int DrawerOpen);

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

System.onScriptLoaded() {
	initAttribs();

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
	DrawerContent.show();
	main.beforeRedock();
	if (animate && scrollconfigdrawerattrib.getData() == "1") {
		lockUI();
		drawer.setTargetX(drawer.getGuiX());
		drawer.setTargetY(-194);
		drawer.setTargetW(drawer.getGuiW());
		drawer.setTargetH(drawer.getGuiH());
		drawer.setTargetSpeed(1);
		drawer.gotoTarget();
	} else {
		drawer.setXMLParam("y","-194");
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
	DrawerContent.hide();

	btnClose.hide();
	btnOpen.show();
	if (animate && scrollconfigdrawerattrib.getData() == "1") {
		lockUI();
		drawer.setTargetX(drawer.getGuiX());
		drawer.setTargetY(-263);
		drawer.setTargetW(drawer.getGuiW());
		drawer.setTargetH(drawer.getGuiH());
		drawer.setTargetSpeed(1);
		drawer.gotoTarget();
	} else {
		drawer.setXMLParam("y","-263");
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
