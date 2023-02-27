#include <lib/std.mi>
#include "attribs.m"

function setTabs(int tabstate);
function setTabContent(int contentstate);

function OpenDrawer(int animate);
function CloseDrawer(int animate);
function updateAttribs();

function ShowDrawer();
function adjustSnapPoints(int DrawerOpen);

function movie_visible(int open);
Function WindowHolder getVideoWindowHolder();
Function WindowHolder getVisWindowHolder();
Function AVS_setHandle(int open);
Function Video_setHandle(int open);
Function Reflow();
Function Preflow(); 

Global Group frameGroup,PlayerMain,VideoVisGroup, dummyGroup;
Global Group tabs,tEQon,tEQoff,tOPTIONSon,tOPTIONSoff,tCOLORTHEMESon,tCOLORTHEMESoff;
Global Group ContentEQ,ContentOPTIONS,ContentCOLORTHEMES;
Global Layer mouseLayerEQ,mouseLayerOPTIONS,mouseLayerCOLORTHEMES;
Global Button btnClose,btnOpen;
Global Group Drawer,DrawerContent; // DrawerShadow,
Global GuiObject ColorThemes;
Global Layout main;
Global Int mychange;
Global Boolean loaded=0;
Global Timer deferred_opendrawer;

/**
 * Some fact:
 * 
 * 	Player only cotains 2 groups: Player.Title.Group & Player.Content.Group
 * 	TitelbarH = 20
 *  Maybe we will add Menu in future !
 * 
 *  PlayerContentGroup contains 2 groups in order: dummy, avs
 * 	Video.H = 244
 * 	dummy.Y = avs.H (should after Video, vertically).
 * 
 * 	if video visible, dummy.H = 100% - videh.H
 * 
 *  Dummy.group contains 2 in orders: drawer, main
 * 	drawer.Y == main.Y == 0
 *  drawer.H = 100%
 *  main is covering drawer.
 * 
 * 	drawer closed: 	mainH = 123
 * 	drawer opened:	mainH = 192
 * 
 * 	================================
 *  Now, the problem :
 * 	 - drawer.H is 100%, but user might increase
 * 	 - drawer.H must protect the drawerInner.H (minimum height of layout)
 * 	 - better if we could remember the size being dictated by user drag (up & down)
 * 	================================
 */
Global Int minMainH, mainH, vidvisH, titlebarH, drawerH, drawerOpenH, drawerCloseH, drawerHmin, videoavsOpened;
Global Button btnAvsOpen, btnVideoOpen;

System.onScriptLoaded() {
	initAttribs();
	// fix:
	minMainH = 123;	//minimum
	titlebarH = 20;
	drawerOpenH = 172;
	drawerCloseH = 103;

	//dynamic var
	mainH = 0;
	drawerH = 0;
	drawerHmin = 0;
	vidvisH = 0;
	videoavsOpened = 0; // 1=video opened, 2=avs opened, 0 = no one.

	frameGroup = getScriptGroup();
	main = frameGroup.getParentLayout();

	dummyGroup=frameGroup.findObject("player.content.dummy.group");

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
	// DrawerShadow = frameGroup.findObject("player.normal.drawer.shadow");
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
	Preflow();
	btnOpen.hide();
	btnClose.show();
	main.beforeRedock();
	// if (animate && scrollconfigdrawerattrib.getData() == "1") {
	// 	// lockUI();
	// 	// drawer.setTargetY(-194);
	// 	// drawer.setTargetX(drawer.getGuiX());
	// 	// drawer.setTargetW(drawer.getGuiW());
	// 	// drawer.setTargetH(drawer.getGuiH());
	// 	// drawer.setTargetSpeed(1);
	// 	// drawer.gotoTarget();

	// 	// main.setTargetH(titlebarH + vidvisH + drawerOpenH);
	// 	// main.setTargetY(main.getGuiY());
	// 	// main.setTargetX(main.getGuiX());
	// 	// main.setTargetW(main.getGuiW());
	// 	// main.setTargetSpeed(1);
	// 	// main.gotoTarget();

	// 	if(drawerH < drawerOpenH){
	// 		main.setXMLParam("h",integertostring(titlebarH + vidvisH + drawerOpenH));
	// 	}

	// 	//sadly the animation cant be async. :(
	// 	// DrawerContent.setTargetY(65);
	// 	// DrawerContent.setTargetX(DrawerContent.getGuiX());
	// 	// DrawerContent.setTargetW(DrawerContent.getGuiW());
	// 	// DrawerContent.setTargetH(DrawerContent.getGuiH());
	// 	// DrawerContent.setTargetSpeed(1);

	// 	// DrawerContent.gotoTarget();
	// 	// DrawerContent.setXMLParam("y","65");
	// 	DrawerContent.setXMLParam("y","65");
	// 	DrawerContent.setXMLParam("alpha","255");

	// } else {
		// drawer.setXMLParam("y","-194");
		if(drawerH < drawerOpenH){
			// main.setXMLParam("h",integertostring(titlebarH + vidvisH + drawerOpenH));
			drawerH = drawerOpenH;
		}
		drawerHmin = drawerOpenH;
		DrawerContent.setXMLParam("y","65");
		DrawerContent.setXMLParam("alpha","255");
		Reflow();

		setPrivateInt("winamp5", "DrawerOpen", 1);
		ColorThemes.show();
		adjustSnapPoints(1);
		updateAttribs();
		main.Redock();
	// }
	// DrawerShadow.show();
//	main.setXmlParam("minimum_h", "397");
}

closeDrawer(int animate) {
	Preflow();
	main.beforeRedock();
//	main.setXmlParam("minimum_h", "280");
	ColorThemes.hide();
	// DrawerContent.hide();
	DrawerContent.setXMLParam("alpha","0");
	DrawerContent.setXMLParam("y","0");

	btnClose.hide();
	btnOpen.show();
	// if (animate && scrollconfigdrawerattrib.getData() == "1") {
	// 	// lockUI();
	// 	// drawer.setTargetY(-263);
	// 	// drawer.setTargetX(drawer.getGuiX());
	// 	// drawer.setTargetW(drawer.getGuiW());
	// 	// drawer.setTargetH(drawer.getGuiH());
	// 	// drawer.setTargetSpeed(1);
	// 	// drawer.gotoTarget();

	// 	//? ANIMATING LAYOUT IS SUCK
	// 	// main.setTargetH(titlebarH + vidvisH);
	// 	// main.setTargetY(main.getGuiY());
	// 	// main.setTargetX(main.getGuiX());
	// 	// main.setTargetW(main.getGuiW());
	// 	// main.setTargetSpeed(1);
	// 	// main.gotoTarget();
	// 	main.setXMLParam("h",integertostring(titlebarH + vidvisH));

	// 	// DrawerContent.setTargetY(65);
	// 	// DrawerContent.setTargetX(drawer.getGuiX());
	// 	// DrawerContent.setTargetW(drawer.getGuiW());
	// 	// DrawerContent.setTargetH(drawer.getGuiH());
	// 	// DrawerContent.setTargetSpeed(1);
	// 	// DrawerContent.gotoTarget();

	// } else {
		// drawer.setXMLParam("y","-263");
		// debugstring("onclose: drawerH:"+integertostring(drawerH)+" ,drawerOpenH:"+integertostring(drawerOpenH), 0);
		if(drawerH == drawerOpenH){
			//main.setXMLParam("h",integertostring(titlebarH + vidvisH));
			drawerH = drawerCloseH;
		}
		// debugstring("onclose2: drawerH:"+integertostring(drawerH)+" ,drawerCloseH:"+integertostring(drawerCloseH), 0);
		drawerHmin = drawerCloseH;
		Reflow();

		// DrawerShadow.hide();
		setPrivateInt("winamp5", "DrawerOpen", 0);
		adjustSnapPoints(0);
		updateAttribs();
		main.redock();
	// }
}

btnClose.onLeftClick() {
	closeDrawer(1);
}

btnOpen.onLeftClick() {
	openDrawer(1);
}

// drawer.onTargetReached() {
// 	if (btnClose.isVisible()) {
// 		setPrivateInt("winamp5", "DrawerOpen", 1);
// 		ColorThemes.show();
// 		adjustSnapPoints(1);
// 	} else {
// 		// DrawerShadow.hide();
// 		setPrivateInt("winamp5", "DrawerOpen", 0);
// 		adjustSnapPoints(0);
// 	}
// 	updateAttribs();
// 	main.redock();
// 	// unlockUI();
// }

ShowDrawer() {
	drawer.setXmlParam("y", "-147");
	ColorThemes.show();
	btnOpen.hide();
	btnClose.show();
	// DrawerShadow.show();
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

// Show or Hide the Video/AVS area.
// called by button.leftCLick
movie_visible(int open){
	if(open == 1){
		VideoVisGroup.show();
		vidvisH = 244;
	}
	else {
		VideoVisGroup.hide();
		vidvisH = 0;
	}
}

// Toggle AVS clicked
btnAvsOpen.onLeftClick() {
	Preflow();

	if(videoavsOpened == 2) { 	// avs is already opened
		// lets close
		AVS_setHandle(0);		// unload animation
		movie_visible(0);		// show container
		videoavsOpened = 0;
	} 
	else 
	if(videoavsOpened == 1) { 	// video is currently opened
		Video_setHandle(0);		// unload media
		AVS_setHandle(1);		// load animation
		videoavsOpened = 2;
	} 
	else {						// no animation yet
		movie_visible(1);		// show container
		AVS_setHandle(1);		// load animation
		videoavsOpened = 2;
	}
	Reflow();
}

// after calculation, actual re-arrange groups vertically
Reflow() {

	int h,y;
	h = 0;
	// h = titlebarH;
	// if(videoavsOpened != 0){
		h += vidvisH;
	// }

	// reduce traffic, we prevent set same value
	y = dummyGroup.getTop();
	if(y != h){
		dummyGroup.setXMLParam("y",integertostring(h));
		dummyGroup.setXMLParam("h",integertostring(h * -1));
	}

	// constraint
	h = titlebarH + vidvisH + drawerHmin;
	main.setXMLParam("minimum_h",integertostring(h));

	// layout:
	main.setXMLParam("h",integertostring(titlebarH + vidvisH + drawerH));

	

}

// attempt to calc  actual drawer.bottom.H
Preflow() {
	mainH = main.getHeight();
	int h;
	h = mainH;
	h -= titlebarH;
	h -= vidvisH;
	drawerH = h; // this is the current real drawer.H
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
AVS_setHandle(int open) {
    GuiObject o = getVisWindowHolder();
    if (o != NULL) { 
		if(open == 1){
			o.show(); 
		}  else {
			o.hide(); 
		}
	}
}

// -----------------------------------------------------------------------
Video_setHandle(int open) {
    GuiObject o = getVideoWindowHolder();
    if (o != NULL) { 
		if(open == 1){
			o.show(); 
		}  else {
			o.hide(); 
		}
	}
}


