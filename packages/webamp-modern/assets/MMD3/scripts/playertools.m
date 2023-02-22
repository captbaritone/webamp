//--------------------------------------------------------------------
// MAINPlayer and SHADEPlayer essentials for MMD3
//--------------------------------------------------------------------
// playertools.m
//--------------------------------------------------------------------
// - Songticker/Display Fader
// - Toggle-LED Status
// - Scroll-Songticker Menu
// - Seeker Ghosts
// - Shade Drawers EQ/THINGER/CONFIG
// - Display ButtonCommands
// - Remember Window and Shade Positions
// - Winshade Mode 2
// - Advanced Visualization
// - VIS-Mode LED-Status
// - EQ-Crossfade
// - Drawers EQ/VIS/ColorThemes
// - glowing effect for mainplay buttons
//--------------------------------------------------------------------
// Script by:		Barti Bartman alias Sven Kistner for MMD3
// Last Modified:	29.11.2002
//--------------------------------------------------------------------
// Feel free to use parts of this script in your own projects
// I know the code looks a litle bit strange. Sorry for that...
// ...I am more a graphic artist than a coder...but it works :)
//--------------------------------------------------------------------

#include "../../../lib/std.mi"

Function MakeSongtickerMenu();
Function setTempText(String txt);
Function setSuperText(String txt);
Function ProcessMenuResult(int a);
Function OpenCloseShadeEQ();
Function OpenCloseShadeConfig();
Function OpenCloseShadeThinger();
Function OpenCloseShadePL();
Function checkshadenext();
Function PrepareShadeDrawer(string i);
Function OpenCloseCTSH1();
Function OpenCloseCTSH2();
Function PrepareSH2Drawer(string i);
Function SetLastShadeMode(int i);
Function OpenCloseEQ();
Function OpenCloseCT();
Function checknext();
Function OpenCloseVIS();
Function ShowVISBg(int nr);
Function PrepareDrawer(string i);
Function SetLEDVISMode(int nr);
Function ShowHint();
Function startglow();
Function stopglow();
Function setLeftRightMode(int i);

Function setFinalToolDrawerPos1();
Function setFinalToolDrawerPos2();
Function setFinalToolDrawerPos3();

Class GuiObject HintObject;
Class ToggleButton HintToggleButton;
Class Button HintButton;

Global Text Songticker,SuperText,SongTickerShade,SongTickerShade2;
Global Slider Seeker, SeekGhost;
Global Slider SeekerShade, SeekGhostShade;
Global Slider SeekerShade2, SeekGhostShade2;
Global Int Seeking, glowing, glow_delta;
Global string textcol;
Global Container mainContainer;
Global Layout mainshade,dummynormal,mainshade2;
Global group mainnormal;
Global Popupmenu tickerMenu;
Global Timer Songtickertimer,textfadetimer,textfadetimer2;
Global Timer glowtimer;
Global HintObject Play, Stop, Previous, Next, Pause, Open;
Global HintToggleButton ToggleCrossfade, ToggleShuffle, ToggleRepeat, ToggleScroll, ToggleScroll2;
Global HintButton ButtonShadeEQ,ButtonShadeThinger,ButtonShadeConfig,CTShade2,CTShade2b,CTShade1;
Global HintButton ButtonSH2Thinger,ButtonSH2EQ,ButtonSH2CFG,Switcher2;
Global Int textfade, CTSH2open,CTSH1open, CTSH2IsReady,CTSH1IsReady;
Global Int ShadeEQOpen,ShadeThingerOpen,ShadeConfigOpen,shadeDrawerIsReady,ShadePLopen;
Global Int SH2EQOpen,SH2CFGOpen,SH2ThingerOpen,SH2DrawerIsReady;
Global string nextshadeopen;
Global Group EQShadeDrawer,ThingerShadeDrawer,ConfigShadeDrawer,EQSpline,ThingerTXT;
Global Group EQSH2Drawer,CFGSH2Drawer,ThingerSH2Drawer,mainshade2main,SH2CTCloser;
Global Group CTDrawerSH2,CTListSh2,CTDrawerSH1,CTListSh1;
Global Layer CrossfadeLED, RepeatLED, ShuffleLED, SupertextBG, SupertextOV;
Global Layer CrossfadeDisplay, RepeatDisplay, ShuffleDisplay,Switcher1,Switcher3;
Global Layer glow;
Global Int ty1,ty2,ty3,lastshademode;
Global AnimatedLayer disani;
Global Timer refreshEQ;
Global int maxVu,lastk;
Global int VuLoop;
Global int isEQOpen,isVISOpen,isCTOpen,DrawerIsReady;
Global int VISMode;
Global Timer HintFadeTimer;
Global int HintFadeCounter;
Global Vis normalVIS;
Global string nextopen;
Global Group OnOffLayer,CTLayer,CTList;
Global HintButton EQPush,EQPush2,VISPush,VISPush2,EQPush2b,VISPush2b,CTPush,CTPush2,CTPush2b,CTPush3,EQPush3,VISPush3;
Global HintButton vb1,vb2,vb3,vb4,vb5,vb6,vb7,vb8,vb9;
Global HintButton VISHint,autobutton;
Global Group EQDrawer,VISDrawer,CTDrawer;
Global Layer AutoLED, OnOffLED;
Global Layer l1,l2,l3,l4,l5,l6,l7,l8,l9;
Global Layer dis1,dis2,dis3,dis4;
Global Slider slidercb;
Global Text fadertext;
Global int EQCTVISDrawer_x_start, EQCTVISDrawer_x_end;
Global int avdelta;
Global Button SongInfoEditor;
Global button configbutton;
Global HintToggleButton baot1,baot2,baot3;
Global AnimatedLayer VolumeLED, BassLED, TrebleLED;
Global Button PLS1,PLS2;
Global Layer PLCloser;
Global Group smallPlaylist;

System.onscriptunloading() {
	delete Songtickertimer;
	delete glowtimer;
	delete textfadetimer;
	delete textfadetimer2;
	delete refreshEQ;
	delete HintFadeTimer;
}

System.onScriptLoaded() {
	Songtickertimer = new Timer;
	Songtickertimer.setDelay(1000);

	textfadetimer = new Timer;
	textfadetimer.setDelay(10);

	textfadetimer2 = new Timer;
	textfadetimer2.setDelay(10);

	glowtimer = new Timer;
	glowtimer.setDelay(20);

	mainContainer=getContainer("main");

	dummynormal = getContainer("main").getLayout("normal");
	mainnormal = dummynormal.getObject("main.mmd3");
	mainshade = getContainer("main").getLayout("shade");
	mainshade2 = getContainer("main").getLayout("shade2");
	mainshade2main = mainshade2.getObject("shade2main");

	smallPlaylist = mainshade.getObject("shade1.plsmall");
	PLS2 = smallPlaylist.getObject("plsmallbut2");
	PLS1 = mainshade.getObject("plsmallbut");
	PLCloser = smallPlaylist.getObject("pls.switcher");

	smallPlaylist.hide();

	configbutton = mainnormal.getObject("maincfg");

	glow = mainnormal.getObject("glow");
	glow.setAlpha(0);
	glowing=0;

	disani= mainnormal.getObject("visani");
	EQDrawer = dummynormal.getObject("main.eq");
	VISDrawer = dummynormal.getObject("main.visd");
	CTDrawer = dummynormal.getObject("main.cthemes");
	OnOffLayer = dummynormal.getObject("onofflayer");
	CTLayer = dummynormal.getObject("main.ctlayer");
	normalVIS = mainnormal.getObject("visual");

	autobutton=EQDrawer.getObject("eqauto");

	CTDrawer.hide();

	EQCTVISDrawer_x_start=149;
	EQCTVISDrawer_x_end=350;

	dis1 = mainnormal.getObject("vis3bg");
	dis2 = mainnormal.getObject("vis3overlay");
	dis3 = mainnormal.getObject("vis2overlay");
	dis4 = mainnormal.getObject("vis2bg");

	EQPush = OnOffLayer.getObject("eqtoggle");
	EQPush2 = EQDrawer.getObject("eqtoggle2");
	EQPush2b = VISDrawer.getObject("eqtoggle2b");
	EQPush3 = CTLayer.getObject("eqtoggle3");

	VISPush = OnOffLayer.getObject("visdtoggle");
	VISPush2 = VISDrawer.getObject("visdtoggle2");
	VISPush2b = EQDrawer.getObject("visdtoggle2b");
	VISPush3 = CTLayer.getObject("visdtoggle3");

	CTPush = OnOffLayer.getObject("cttoggle");
	CTPush2 = VISDrawer.getObject("cttoggle2b");
	CTPush2b = EQDrawer.getObject("cttoggle2");
	CTPush3 = CTDrawer.getObject("cttoggle3");

	CTList = dummynormal.getObject("main.ctlist");
	CTList.hide();

	VISHint = mainnormal.getObject("vis2hint");
	HintFadeTimer = new Timer;
	HintFadeTimer.setDelay(20);

	vb1 = VISDrawer.getObject("visbbg1");
	vb2 = VISDrawer.getObject("visbbg2");
	vb3 = VISDrawer.getObject("visbbg3");
	vb4 = VISDrawer.getObject("visbbg4");
	vb5 = VISDrawer.getObject("visbbg5");
	vb6 = VISDrawer.getObject("visbbg6");

	vb7 = VISDrawer.getObject("visbfg1");
	vb8 = VISDrawer.getObject("visbfg2");
	vb9 = VISDrawer.getObject("visbfg3");

	l1 = VISDrawer.getObject("vled1");
	l2 = VISDrawer.getObject("vled2");
	l3 = VISDrawer.getObject("vled3");
	l4 = VISDrawer.getObject("vled4");
	l5 = VISDrawer.getObject("vled5");
	l6 = VISDrawer.getObject("vled6");

	l7 = VISDrawer.getObject("vled7");
	l8 = VISDrawer.getObject("vled8");
	l9 = VISDrawer.getObject("vled9");

	slidercb = EQDrawer.getObject("sCrossfade");
	fadertext = EQDrawer.getObject("cftext");
	slidercb.onSetPosition(slidercb.getPosition());

	AutoLED = EQDrawer.getObject("eqautoLed");
	OnOffLED = EQDrawer.getObject("eqonoffLed");

	isEQOpen = 0;
	isVISOpen = 0;
	isCTOpen = 0;

	DrawerIsReady = 1;
	nextopen="";

	refreshEQ = new Timer;
	refreshEQ.setDelay(20);

	maxVu=0;
	lastk=0;
	VuLoop=0;
	avdelta=2;

	OnOffLED.hide();
	AutoLED.hide();

	VISMode = getPrivateInt("MMD3", "AVISMODE", 1);
	ShowVISBg(VISMode);

	int dummymode = getPrivateInt("MMD3", "LASTMODE", 0);
	if (dummymode>0) refreshEQ.stop();

	if ( system.getEQ() ) OnOffLED.show();
	if ( autobutton.getActivated()==1 ) AutoLED.show();

	VolumeLED = mainnormal.getObject("VolumeAnimLED");
	BassLED = mainnormal.getObject("BassAnimLED");
	TrebleLED = mainnormal.getObject("TrebleAnimLED");

	Switcher1 = mainnormal.getObject("mslabel11");
	Switcher2 = mainnormal.getObject("bmsmall");
	Switcher3 = mainnormal.getObject("nm.switcher");

	CTShade1 = mainshade.getObject("eqpl_ct");
	CTDrawerSH1 = mainshade.getObject("shade1.cthemes");


	CTShade2 = mainshade2main.getObject("shade2ct");
	CTDrawerSH2 = mainshade2.getObject("shade2.cthemes");

	ButtonSH2Thinger = mainshade2main.getObject("s2thinger");
	ButtonSH2EQ = mainshade2main.getObject("s2eq");
	ButtonSH2Cfg = mainshade2main.getObject("s2cfg");

	SH2CTCloser = mainshade2.getObject("shade2.ctcloser");
	CTShade2b = SH2CTCloser.getObject("sh2closect");

	SH2CTCloser.hide();

	CTListSh1 = mainshade.getObject("shade1.ctlist");
	CTListSh1.hide();
	CTSH1open=0;
	CTSH1IsReady=1;

	CTListSh2 = mainshade2.getObject("shade2.ctlist");
	CTListSh2.hide();
	CTSH2open=0;
	CTSH2IsReady=1;

	SH2EQOpen=0;
	SH2CFGOpen=0;
	SH2ThingerOpen=0;
	SH2DrawerIsReady=1;

	ty1=105;
	ty2=105;
	ty3=105;

	EQSH2Drawer = mainshade2.getObject("shade2.eq");
	ThingerSH2Drawer = mainshade2.getObject("shade2.thinger");
	CFGSH2Drawer = mainshade2.getObject("shade2.cfg");


	int ToolOpen,ToolStartY;

	ToolStartY=173;

	ToolOpen=getPrivateInt("MMD3", "sh2t1", 1);
	if (ToolOpen) {
		ThingerSH2Drawer.setXMLParam("y", integerToString(ToolStartY));
		ToolStartY+=67;
		SH2ThingerOpen=1;
		ButtonSH2Thinger.setActivated(SH2ThingerOpen);
	}

	ToolOpen=getPrivateInt("MMD3", "sh2t2", 1);
	if (ToolOpen) {
		EQSH2Drawer.setXMLParam("y", integerToString(ToolStartY));
		ToolStartY+=67;
		SH2EQOpen=1;
		ButtonSH2EQ.setActivated(SH2EQOpen);
	}

	ToolOpen=getPrivateInt("MMD3", "sh2t3", 1);
	if (ToolOpen) {
		CFGSH2Drawer.setXMLParam("y", integerToString(ToolStartY));
		ToolStartY+=67;
		SH2CFGOpen=1;
		ButtonSH2CFG.setActivated(SH2CFGOpen);
	}


	// Get songticker & Seeker
	Songticker = mainnormal.getObject("songticker");
	Supertext = mainnormal.getObject("songticker2");
	SupertextBG = mainnormal.getObject("titleoverlay2");
	SupertextOV = mainnormal.getObject("titleoverlay3");

	SupertextBG.hide();
	SupertextOV.hide();
	Supertext.hide();

	Seeker = mainnormal.getObject("Seeker");
	SeekGhost = mainnormal.getObject("SeekerGhost");

	SeekerShade = mainshade.getObject("sSeeker1");
	SeekGhostShade = mainshade.getObject("sSeekerGhost1");
	SeekerShade2 = mainshade.getObject("sSeeker2");
	SeekGhostShade2 = mainshade.getObject("sSeekerGhost2");

	// Get buttons
	Play = mainnormal.getObject("Play");
	Pause = mainnormal.getObject("Pause");
	Stop = mainnormal.getObject("Stop");
	Next = mainnormal.getObject("Next");
	Previous = mainnormal.getObject("Previous");
	Open = mainnormal.getObject("Eject");

	ToggleCrossfade = mainnormal.getObject("Crossfade");
	ToggleShuffle = mainnormal.getObject("Shuffle");
	ToggleRepeat = mainnormal.getObject("Repeat");

	EQShadeDrawer = mainshade.getObject("shade.eq");
	ThingerShadeDrawer = mainshade.getObject("shade.thinger");
	ConfigShadeDrawer = mainshade.getObject("shade.config");


	EQSpline = mainshade.getObject("shade.eqspline");
	ThingerTXT = mainshade.getObject("shade.thingertxt");
	EQSpline.hide();
	ThingerTXT.hide();

	ButtonShadeEQ = mainshade.getObject("eqpl_eq");
	ButtonShadeThinger = mainshade.getObject("eqpl_t");
	ButtonShadeConfig = mainshade.getObject("eqpl_cfg");
	ShadeEQOpen=0;
	ShadeThingerOpen=0;
	ShadeConfigOpen=0;
	ShadePLOpen=0;
	shadeDrawerIsReady = 1;
	nextshadeopen="";

	CrossfadeLED = mainnormal.getObject("CrossfadeLed");
	ShuffleLED = mainnormal.getObject("ShuffleLed");
	RepeatLED = mainnormal.getObject("RepeatLed");

	CrossfadeDisplay = mainnormal.getObject("CrossfadeDis");
	ShuffleDisplay = mainnormal.getObject("ShuffleDis");
	RepeatDisplay = mainnormal.getObject("RepeatDis");


	// Set buttons status
	SongTickerShade = mainshade.getObject("SongtickerShade");
	SongTickerShade2 = mainshade2main.getObject("SongtickerShade2");
	int shadescroll=getPrivateInt("MMD3", "scrollticker", 1);

	ToggleScroll=ConfigShadeDrawer.getObject("scrolltickershade");
	ToggleScroll2=CFGSH2Drawer.getObject("scrolltickershade2");

	ToggleScroll.setActivated(shadescroll);
	ToggleScroll2.setActivated(shadescroll);
	if (shadescroll==1) {
		SongTickerShade.setXMLParam("ticker", "1");
		SongTickerShade2.setXMLParam("ticker", "1");
	} else {
		SongTickerShade.setXMLParam("ticker", "0");
		SongTickerShade2.setXMLParam("ticker", "0");
	}


	MakeSongtickerMenu();
	ProcessMenuResult( getPrivateInt("MMD3", "scrollticker", 1) );
	ProcessMenuResult( getPrivateInt("MMD3", "scrolltickersize", 3) );
	ProcessMenuResult( ( getPrivateInt("MMD3", "LeftRightMode", 0) +20) );
	ProcessMenuResult( ( getPrivateInt("MMD3", "knobLED", 1) +50) );


	baot1 = mainnormal.getObject("aotdummy");
	baot2 = ConfigShadeDrawer.getObject("playershade.button.aot");
	baot3 = CFGSH2Drawer.getObject("s2aot");

	int aotws = getPrivateInt("MMD3", "aotmode", 1);

	baot2.setActivated(aotws);
	baot3.setActivated(aotws);

	int aotws2 = baot1.getActivated();

	if (dummymode>0 && aotws==1 && aotws2==0) baot1.leftClick();

	SetLastShadeMode( getPrivateInt("MMD3", "lastshademode", 1) );

	SongInfoEditor = mainnormal.getObject("SongInfoEditor");



	int act;

	act=ToggleCrossfade.getActivated();
	ToggleCrossfade.setActivated(act);
	CrossfadeLED.setAlpha(255*act);
	CrossfadeDisplay.setAlpha(255*act);

	act=ToggleShuffle.getActivated();
	ToggleShuffle.setActivated(act);
	ShuffleLED.setAlpha(255*act);
	ShuffleDisplay.setAlpha(255*act);

	act=ToggleRepeat.getActivated();
	ToggleRepeat.setActivated(act);
	RepeatLED.setAlpha(255*act);
	RepeatDisplay.setAlpha(255*act);




	if (SeekGhost != NULL) SeekGhost.setAlpha(1);
	if (SeekGhostShade != NULL) {
		SeekGhostShade.setAlpha(1);
		SeekGhostShade2.setAlpha(1);
	}


}


Seeker.onSetPosition(int p) {
	if (!SeekGhost && seeking) {
		Float f;
		f = p;
		f = f / 255 * 100;
		Float len = getPlayItemLength();
		if (len != 0) {
			int np = len * f / 100;
			setTempText("SEEK: " + integerToTime(np) + "/" + integerToTime(len) + " (" + integerToString(f) + "%) ");
		}
	}
}


Seeker.onLeftButtonDown(int x, int y) {
	seeking = 1;
}

Seeker.onLeftButtonUp(int x, int y) {
	seeking = 0;
	setTempText("");
}

SeekGhost.onSetPosition(int p) {
	if (getalpha() == 1) return;
	Float f;
	f = p;
	f = f / 255 * 100;
	Float len = getPlayItemLength();
	if (len != 0) {
		int np = len * f / 100;
		setTempText("SEEK: " + integerToTime(np) + "/" + integerToTime(len) + " (" + integerToString(f) + "%)");
	}
}

SeekGhost.onLeftButtonDown(int x, int y) {
	SeekGhost.setAlpha(128);
}

SeekGhost.onLeftButtonUp(int x, int y) {
	SeekGhost.setAlpha(1);
}

Seeker.onSetFinalPosition(int p) {
	Songticker.setAlternateText("");
}

SeekGhost.onsetfinalposition(int p) {
	Songticker.setAlternateText("");
	SeekGhost.setAlpha(1);
}

SeekerShade.onSetPosition(int p) {
	if (!SeekGhostShade && seeking) {
		Float f;
		f = p;
		f = f / 255 * 100;
		Float len = getPlayItemLength();
		if (len != 0) {
			int np = len * f / 100;
			setTempText("SEEK: " + integerToTime(np) + "/" + integerToTime(len) + " (" + integerToString(f) + "%) ");
		}
	}
}

SeekerShade.onLeftButtonDown(int x, int y) {
	seeking = 1;
}

SeekerShade.onLeftButtonUp(int x, int y) {
	seeking = 0;
	setTempText("");
}

SeekGhostShade.onSetPosition(int p) {
	if (getalpha() == 1) return;
	Float f;
	f = p;
	f = f / 255 * 100;
	Float len = getPlayItemLength();
	if (len != 0) {
		int np = len * f / 100;
		setTempText("SEEK: " + integerToTime(np) + "/" + integerToTime(len) + " (" + integerToString(f) + "%)");
	}
}

SeekGhostShade.onLeftButtonDown(int x, int y) {
	SeekGhostShade.setAlpha(128);
}

SeekGhostShade.onLeftButtonUp(int x, int y) {
	SeekGhostShade.setAlpha(1);
}

SeekerShade.onSetFinalPosition(int p) {
	Songticker.setAlternateText("");
}

SeekGhostShade.onsetfinalposition(int p) {
	Songticker.setAlternateText("");
	SeekGhostShade.setAlpha(1);
}

SeekerShade2.onSetPosition(int p) {
	if (!SeekGhostShade2 && seeking) {
		Float f;
		f = p;
		f = f / 255 * 100;
		Float len = getPlayItemLength();
		if (len != 0) {
			int np = len * f / 100;
			setTempText("SEEK: " + integerToTime(np) + "/" + integerToTime(len) + " (" + integerToString(f) + "%) ");
		}
	}
}

SeekerShade2.onLeftButtonDown(int x, int y) {
	seeking = 1;
}

SeekerShade2.onLeftButtonUp(int x, int y) {
	seeking = 0;
	setTempText("");
}

SeekGhostShade2.onSetPosition(int p) {
	if (getalpha() == 1) return;
	Float f;
	f = p;
	f = f / 255 * 100;
	Float len = getPlayItemLength();
	if (len != 0) {
		int np = len * f / 100;
		setTempText("SEEK: " + integerToTime(np) + "/" + integerToTime(len) + " (" + integerToString(f) + "%)");
	}
}

SeekGhostShade2.onLeftButtonDown(int x, int y) {
	SeekGhostShade2.setAlpha(128);
}

SeekGhostShade2.onLeftButtonUp(int x, int y) {
	SeekGhostShade2.setAlpha(1);
}

SeekerShade2.onSetFinalPosition(int p) {
	Songticker.setAlternateText("");
}

SeekGhostShade2.onsetfinalposition(int p) {
	Songticker.setAlternateText("");
	SeekGhostShade2.setAlpha(1);
}



HintObject.onLeftButtonDown(int x, int y) {
	if (HintObject == Play) setSuperText("Play");
	else if (HintObject == Stop) setSuperText("Stop");
	else if (HintObject == Pause) setSuperText("Pause");
	else if (HintObject == Next) setSuperText("Next");
	else if (HintObject == Previous) setSuperText("Previous");
	else if (HintObject == Open) setSuperText("Open");
}

HintToggleButton.onLeftButtonDown(int x, int y) {
	if (HintToggleButton == ToggleCrossfade) setSuperText("Crossfade");
	else if (HintToggleButton == ToggleRepeat) setSuperText("Repeat");
	else if (HintToggleButton == ToggleShuffle) setSuperText("Shuffle");
}

HintToggleButton.onToggle(int onoff) {
	String cmd, txt;
	txt="none";
	if (HintToggleButton == ToggleCrossfade) {
		txt = "Crossfade";
	} else if (HintToggleButton == ToggleRepeat) {
		txt = "Repeat";
	} else if (HintToggleButton == ToggleShuffle) {
		txt = "Shuffle";
	}
	if (txt != "none") {
		String s;
		if (onoff) s = "on"; else s = "off";
		setSuperText(txt + " now " + s);
	}
}


ToggleRepeat.onActivate(int activated) {
	RepeatLED.setAlpha(activated*255);
	RepeatDisplay.setAlpha(activated*255);
}

ToggleShuffle.onActivate(int activated) {
	ShuffleLED.setAlpha(activated*255);
	ShuffleDisplay.setAlpha(activated*255);
}

ToggleCrossfade.onActivate(int activated) {
	CrossfadeLED.setAlpha(activated*255);
	CrossfadeDisplay.setAlpha(activated*255);
}

setTempText(String txt) {
	Songtickertimer.stop();
	Songticker.setAlternateText(txt);
	Songtickertimer.start();
}

setSuperText(String txt) {
	textfadetimer2.stop();
	textfadetimer.stop();
	SupertextBG.setAlpha(255);
	SupertextOV.setAlpha(0);
	SupertextBG.show();
	SupertextOV.show();
	SuperText.setText(txt);
	Supertext.show();
	textfade=5;
	textfadetimer.start();

}

textfadetimer.ontimer() {
	textfade+=20;
	SupertextOV.setAlpha(textfade);

	if (textfade<250) {
		//for future use
	} else {
		textfade=255;
		SuperText.setText("");
		SupertextBG.setAlpha(textfade);
		SupertextOV.setAlpha(0);
		SupertextBG.show();
		SupertextOV.show();
		textfadetimer.stop();
		textfadetimer2.stop();
		textfadetimer2.start();

	}

}

textfadetimer2.ontimer() {
	textfade-=30;
	SupertextBG.setAlpha(textfade);

	if (textfade>0) {
		//for future use
	} else {
		textfade=0;
		SupertextBG.setAlpha(textfade);
		SupertextBG.hide();
		SupertextOV.hide();
	Supertext.hide();
		textfadetimer2.stop();
	}

}

Songtickertimer.onTimer() {
	Songticker.setText("");
	stop();
}


CTShade2.onLeftClick() {
	if (CTSH2open) {
		SH2CTCloser.hide();
	} else {
		SH2CTCloser.show();
	}

	OpenCloseCTSH2();
}


CTShade1.onLeftClick() {
	OpenCloseCTSH1();
}

OpenCloseCTSH1() {
	if (CTSH1IsReady && ShadePLOpen==0) {
		CTSH1IsReady=0;
		if (CTSH1Open) {
			CTListSh1.hide();
			CTDrawerSH1.setTargetX(333);
			CTDrawerSH1.setTargetY(-122);
			CTDrawerSH1.setTargetSpeed(1);
			CTDrawerSH1.gotoTarget();
			CTSH1Open = 0;

		} else {
			CTDrawerSH1.setTargetX(333);
			CTDrawerSH1.setTargetY(21);
			CTDrawerSH1.setTargetSpeed(1);
			CTDrawerSH1.gotoTarget();
			CTSH1Open = 1;
		}
	}
}

CTDrawerSH1.onTargetReached() {
	if (CTSH1Open) {
		CTDrawerSH1.setXMLParam("y", "21");
		CTListSh1.show();
	}
	CTShade1.setActivated(CTSH1Open);
	CTSH1IsReady=1;
}



CTShade2b.onLeftClick() {
	SH2CTCloser.hide();
	OpenCloseCTSH2();
}

OpenCloseCTSH2() {
	if (CTSH2IsReady) {
		CTSH2IsReady=0;
		if (CTSH2Open) {
			CTListSh2.hide();
			CTDrawerSH2.setTargetX(0);
			CTDrawerSH2.setTargetY(-29);
			CTDrawerSH2.setTargetSpeed(1);
			CTDrawerSH2.gotoTarget();
			CTSH2Open = 0;

		} else {
			CTDrawerSH2.setTargetX(0);
			CTDrawerSH2.setTargetY(173);
			CTDrawerSH2.setTargetSpeed(1);
			CTDrawerSH2.gotoTarget();
			CTSH2Open = 1;
		}
	}
}

CTDrawerSH2.onTargetReached() {
	if (CTSH2Open) {
		CTDrawerSH2.setXMLParam("y", "173");
		CTListSh2.show();
	}

	CTSH2IsReady=1;
}

ButtonSH2Thinger.onLeftClick() {
	PrepareSH2Drawer("thinger");
}

ButtonSH2EQ.onLeftClick() {
	PrepareSH2Drawer("eq");
}

ButtonSH2CFG.onLeftClick() {
	PrepareSH2Drawer("cfg");
}


PrepareSH2Drawer(string i) {
	if (i=="thinger" && SH2EQOpen==0 && SH2CFGOpen==0 && SH2DrawerIsReady) {
		if (SH2ThingerOpen==0) {
			SH2DrawerIsReady=0;
			ThingerSH2Drawer.setTargetX(0);
			ThingerSH2Drawer.setTargetY(173);
			ThingerSH2Drawer.setTargetSpeed(1);
			ThingerSH2Drawer.gotoTarget();
			ty1=173;

			SH2ThingerOpen = 1;
		} else {
			SH2DrawerIsReady=0;
			ThingerSH2Drawer.setTargetX(0);
			ThingerSH2Drawer.setTargetY(105);
			ThingerSH2Drawer.setTargetSpeed(1);
			ThingerSH2Drawer.gotoTarget();
			ty1=105;

			SH2ThingerOpen = 0;
		}
	}

	if (i=="thinger" && SH2EQOpen==1 && SH2CFGOpen==0 && SH2DrawerIsReady) {
		if (SH2ThingerOpen==0) {
			SH2DrawerIsReady=0;
			ThingerSH2Drawer.setTargetX(0);
			ThingerSH2Drawer.setTargetY(173);
			ThingerSH2Drawer.setTargetSpeed(1);
			ty1=173;

			EQSH2Drawer.setTargetX(0);
			EQSH2Drawer.setTargetY(240);
			EQSH2Drawer.setTargetSpeed(1);
			ty2=240;

			ThingerSH2Drawer.gotoTarget();
			EQSH2Drawer.gotoTarget();

			SH2ThingerOpen = 1;
		} else {
			SH2DrawerIsReady=0;
			ThingerSH2Drawer.setTargetX(0);
			ThingerSH2Drawer.setTargetY(105);
			ThingerSH2Drawer.setTargetSpeed(1);
			ty1=105;

			EQSH2Drawer.setTargetX(0);
			EQSH2Drawer.setTargetY(173);
			EQSH2Drawer.setTargetSpeed(1);
			ty2=173;

			ThingerSH2Drawer.gotoTarget();
			EQSH2Drawer.gotoTarget();

			SH2ThingerOpen = 0;
		}
	}


	if (i=="thinger" && SH2EQOpen==0 && SH2CFGOpen==1 && SH2DrawerIsReady) {
		if (SH2ThingerOpen==0) {
			SH2DrawerIsReady=0;
			ThingerSH2Drawer.setTargetX(0);
			ThingerSH2Drawer.setTargetY(173);
			ThingerSH2Drawer.setTargetSpeed(1);
			ty1=173;

			CFGSH2Drawer.setTargetX(0);
			CFGSH2Drawer.setTargetY(240);
			CFGSH2Drawer.setTargetSpeed(1);
			ty3=240;

			ThingerSH2Drawer.gotoTarget();
			CFGSH2Drawer.gotoTarget();

			SH2ThingerOpen = 1;
		} else {
			SH2DrawerIsReady=0;
			ThingerSH2Drawer.setTargetX(0);
			ThingerSH2Drawer.setTargetY(105);
			ThingerSH2Drawer.setTargetSpeed(1);
			ty1=105;

			CFGSH2Drawer.setTargetX(0);
			CFGSH2Drawer.setTargetY(173);
			CFGSH2Drawer.setTargetSpeed(1);
			ty3=173;

			ThingerSH2Drawer.gotoTarget();
			CFGSH2Drawer.gotoTarget();

			SH2ThingerOpen = 0;
		}
	}

	if (i=="thinger" && SH2EQOpen==1 && SH2CFGOpen==1 && SH2DrawerIsReady) {
		if (SH2ThingerOpen==0) {
			SH2DrawerIsReady=0;
			ThingerSH2Drawer.setTargetX(0);
			ThingerSH2Drawer.setTargetY(173);
			ThingerSH2Drawer.setTargetSpeed(1);
			ty1=173;

			EQSH2Drawer.setTargetX(0);
			EQSH2Drawer.setTargetY(240);
			EQSH2Drawer.setTargetSpeed(1);
			ty2=240;

			CFGSH2Drawer.setTargetX(0);
			CFGSH2Drawer.setTargetY(307);
			CFGSH2Drawer.setTargetSpeed(1);
			ty3=307;

			ThingerSH2Drawer.gotoTarget();
			EQSH2Drawer.gotoTarget();
			CFGSH2Drawer.gotoTarget();

			SH2ThingerOpen = 1;
		} else {
			SH2DrawerIsReady=0;
			ThingerSH2Drawer.setTargetX(0);
			ThingerSH2Drawer.setTargetY(105);
			ThingerSH2Drawer.setTargetSpeed(1);
			ty1=105;

			EQSH2Drawer.setTargetX(0);
			EQSH2Drawer.setTargetY(173);
			EQSH2Drawer.setTargetSpeed(1);
			ty2=173;

			CFGSH2Drawer.setTargetX(0);
			CFGSH2Drawer.setTargetY(240);
			CFGSH2Drawer.setTargetSpeed(1);
			ty3=240;

			ThingerSH2Drawer.gotoTarget();
			EQSH2Drawer.gotoTarget();
			CFGSH2Drawer.gotoTarget();

			SH2ThingerOpen = 0;
		}
	}








	if (i=="eq" && SH2ThingerOpen==0 && SH2CFGOpen==0 && SH2DrawerIsReady) {
		if (SH2EQOpen==0) {
			SH2DrawerIsReady=0;
			EQSH2Drawer.setTargetX(0);
			EQSH2Drawer.setTargetY(173);
			EQSH2Drawer.setTargetSpeed(1);
			EQSH2Drawer.gotoTarget();
			SH2EQOpen = 1;
			ty2=173;
		} else {
			SH2DrawerIsReady=0;
			EQSH2Drawer.setTargetX(0);
			EQSH2Drawer.setTargetY(105);
			EQSH2Drawer.setTargetSpeed(1);
			EQSH2Drawer.gotoTarget();
			SH2EQOpen = 0;
			ty2=105;
		}
	}

	if (i=="eq" && SH2ThingerOpen==1 && SH2CFGOpen==0 && SH2DrawerIsReady) {
		if (SH2EQOpen==0) {
			EQSH2Drawer.setXMLParam("y", "173");
			SH2DrawerIsReady=0;
			EQSH2Drawer.setTargetX(0);
			EQSH2Drawer.setTargetY(240);
			EQSH2Drawer.setTargetSpeed(1);
			EQSH2Drawer.gotoTarget();
			SH2EQOpen = 1;
			ty2=240;

		} else {
			SH2DrawerIsReady=0;
			EQSH2Drawer.setTargetX(0);
			EQSH2Drawer.setTargetY(173);
			EQSH2Drawer.setTargetSpeed(1);
			EQSH2Drawer.gotoTarget();
			SH2EQOpen = 0;
			ty2=105;
		}
	}


	if (i=="eq" && SH2ThingerOpen==0 && SH2CFGOpen==1 && SH2DrawerIsReady) {
		if (SH2EQOpen==0) {
			SH2DrawerIsReady=0;
			EQSH2Drawer.setTargetX(0);
			EQSH2Drawer.setTargetY(173);
			EQSH2Drawer.setTargetSpeed(1);
			ty2=173;

			CFGSH2Drawer.setTargetX(0);
			CFGSH2Drawer.setTargetY(240);
			CFGSH2Drawer.setTargetSpeed(1);
			ty3=240;

			EQSH2Drawer.gotoTarget();
			CFGSH2Drawer.gotoTarget();

			SH2EQOpen = 1;
		} else {
			SH2DrawerIsReady=0;
			EQSH2Drawer.setTargetX(0);
			EQSH2Drawer.setTargetY(105);
			EQSH2Drawer.setTargetSpeed(1);
			ty2=105;

			CFGSH2Drawer.setTargetX(0);
			CFGSH2Drawer.setTargetY(173);
			CFGSH2Drawer.setTargetSpeed(1);
			ty3=173;

			EQSH2Drawer.gotoTarget();
			CFGSH2Drawer.gotoTarget();

			SH2EQOpen = 0;
		}
	}

	if (i=="eq" && SH2ThingerOpen==1 && SH2CFGOpen==1 && SH2DrawerIsReady) {
		if (SH2EQOpen==0) {
			SH2DrawerIsReady=0;
			EQSH2Drawer.setXMLParam("y", "173");
			EQSH2Drawer.setTargetX(0);
			EQSH2Drawer.setTargetY(240);
			EQSH2Drawer.setTargetSpeed(1);
			ty2=240;

			CFGSH2Drawer.setTargetX(0);
			CFGSH2Drawer.setTargetY(307);
			CFGSH2Drawer.setTargetSpeed(1);
			ty3=307;

			EQSH2Drawer.gotoTarget();
			CFGSH2Drawer.gotoTarget();

			SH2EQOpen = 1;

		} else {
			SH2DrawerIsReady=0;
			EQSH2Drawer.setTargetX(0);
			EQSH2Drawer.setTargetY(173);
			EQSH2Drawer.setTargetSpeed(1);
			ty2=105;

			CFGSH2Drawer.setTargetX(0);
			CFGSH2Drawer.setTargetY(240);
			CFGSH2Drawer.setTargetSpeed(1);
			ty3=240;

			EQSH2Drawer.gotoTarget();
			CFGSH2Drawer.gotoTarget();

			SH2EQOpen = 0;

		}
	}








	if (i=="cfg" && SH2ThingerOpen==0 && SH2EQOpen==0 && SH2DrawerIsReady) {
		if (SH2CFGOpen==0) {
			SH2DrawerIsReady=0;
			CFGSH2Drawer.setTargetX(0);
			CFGSH2Drawer.setTargetY(173);
			CFGSH2Drawer.setTargetSpeed(1);
			CFGSH2Drawer.gotoTarget();
			SH2CFGOpen = 1;
			ty3=173;
		} else {
			SH2DrawerIsReady=0;
			CFGSH2Drawer.setTargetX(0);
			CFGSH2Drawer.setTargetY(105);
			CFGSH2Drawer.setTargetSpeed(1);
			CFGSH2Drawer.gotoTarget();
			SH2CFGOpen = 0;
			ty3=105;
		}
	}

	if (i=="cfg" && SH2ThingerOpen==1 && SH2EQOpen==0 && SH2DrawerIsReady) {
		if (SH2CFGOpen==0) {
			CFGSH2Drawer.setXMLParam("y", "173");
			SH2DrawerIsReady=0;
			CFGSH2Drawer.setTargetX(0);
			CFGSH2Drawer.setTargetY(240);
			CFGSH2Drawer.setTargetSpeed(1);
			CFGSH2Drawer.gotoTarget();
			SH2CFGOpen = 1;
			ty3=240;

		} else {
			SH2DrawerIsReady=0;
			CFGSH2Drawer.setTargetX(0);
			CFGSH2Drawer.setTargetY(173);
			CFGSH2Drawer.setTargetSpeed(1);
			CFGSH2Drawer.gotoTarget();
			SH2CFGOpen = 0;
			ty3=105;
		}
	}


	if (i=="cfg" && SH2ThingerOpen==0 && SH2EQOpen==1 && SH2DrawerIsReady) {
		if (SH2CFGOpen==0) {
			CFGSH2Drawer.setXMLParam("y", "173");
			SH2DrawerIsReady=0;
			CFGSH2Drawer.setTargetX(0);
			CFGSH2Drawer.setTargetY(240);
			CFGSH2Drawer.setTargetSpeed(1);
			CFGSH2Drawer.gotoTarget();
			SH2CFGOpen = 1;
			ty3=240;

		} else {
			SH2DrawerIsReady=0;
			CFGSH2Drawer.setTargetX(0);
			CFGSH2Drawer.setTargetY(173);
			CFGSH2Drawer.setTargetSpeed(1);
			CFGSH2Drawer.gotoTarget();
			SH2CFGOpen = 0;
			ty3=105;
		}
	}

	if (i=="cfg" && SH2ThingerOpen==1 && SH2EQOpen==1 && SH2DrawerIsReady) {
		if (SH2CFGOpen==0) {
			CFGSH2Drawer.setXMLParam("y", "240");
			SH2DrawerIsReady=0;
			CFGSH2Drawer.setTargetX(0);
			CFGSH2Drawer.setTargetY(307);
			CFGSH2Drawer.setTargetSpeed(1);
			CFGSH2Drawer.gotoTarget();
			SH2CFGOpen = 1;
			ty3=307;

		} else {
			SH2DrawerIsReady=0;
			CFGSH2Drawer.setTargetX(0);
			CFGSH2Drawer.setTargetY(240);
			CFGSH2Drawer.setTargetSpeed(1);
			CFGSH2Drawer.gotoTarget();
			SH2CFGOpen = 0;
			ty3=105;
		}
	}


}


EQSH2Drawer.onTargetReached() {
	SH2DrawerIsReady=1;
	setFinalToolDrawerPos2();
	ButtonSH2EQ.setActivated(SH2EQOpen);
	setPrivateInt("MMD3", "sh2t2", SH2EQOpen);
}

ThingerSH2Drawer.onTargetReached() {
	SH2DrawerIsReady=1;
	setFinalToolDrawerPos1();
	ButtonSH2Thinger.setActivated(SH2ThingerOpen);
	setPrivateInt("MMD3", "sh2t1", SH2ThingerOpen);
}

CFGSH2Drawer.onTargetReached() {
	SH2DrawerIsReady=1;
	setFinalToolDrawerPos3();
	ButtonSH2CFG.setActivated(SH2CFGOpen);
	setPrivateInt("MMD3", "sh2t3", SH2CFGOpen);

}


setFinalToolDrawerPos1() {
	ThingerSH2Drawer.setXMLParam("y", integerToString(ty1));
}

setFinalToolDrawerPos2() {
	EQSH2Drawer.setXMLParam("y", integerToString(ty2));
}

setFinalToolDrawerPos3() {
	CFGSH2Drawer.setXMLParam("y", integerToString(ty3));

}






PLCloser.onLeftButtonDblClk(Int intX, Int intY) {
	OpenCloseShadePL();
}

PLS1.onLeftClick() {
	OpenCloseShadePL();
}

PLS2.onLeftClick() {
	openCloseShadePL();
}



ButtonShadeEQ.onLeftClick() {
	PrepareShadeDrawer("sEQ");
}

ButtonShadeThinger.onLeftClick() {
	PrepareShadeDrawer("sThinger");
}

ButtonShadeConfig.onLeftClick() {
	PrepareShadeDrawer("sConfig");
}

OpenCloseShadeEQ() {
	if (ShadeEQOpen) {
		EQShadeDrawer.setTargetX(514);
		EQShadeDrawer.setTargetY(-44);
		EQShadeDrawer.setTargetSpeed(1);
		EQShadeDrawer.gotoTarget();
		ShadeEQOpen = 0;
		EQSpline.hide();
	} else {
		EQShadeDrawer.setTargetX(514);
		EQShadeDrawer.setTargetY(22);
		EQShadeDrawer.setTargetSpeed(1);
		EQShadeDrawer.gotoTarget();
		ShadeEQOpen = 1;
		EQSpline.show();
	}
}


OpenCloseShadeThinger() {
	if (ShadeThingerOpen) {
		ThingerShadeDrawer.setTargetX(514);
		ThingerShadeDrawer.setTargetY(-44);
		ThingerShadeDrawer.setTargetSpeed(1);
		ThingerShadeDrawer.gotoTarget();
		ShadeThingerOpen = 0;
		ThingerTXT.hide();

	} else {
		ThingerShadeDrawer.setTargetX(514);
		ThingerShadeDrawer.setTargetY(22);
		ThingerShadeDrawer.setTargetSpeed(1);
		ThingerShadeDrawer.gotoTarget();
		ShadeThingerOpen = 1;
		ThingerTXT.show();

	}
}

OpenCloseShadePL() {
	if (ShadePLOpen) {
		smallPlaylist.setTargetX(246);
		smallPlaylist.setTargetY(-161);
		smallPlaylist.setTargetSpeed(1);
		smallPlaylist.gotoTarget();
		ShadePLOpen = 0;
	} else {

		if (CTSH1Open) {
			CTListSh1.hide();
			CTDrawerSH1.setTargetX(333);
			CTDrawerSH1.setTargetY(-122);
			CTDrawerSH1.setTargetSpeed(1);
			CTDrawerSH1.gotoTarget();
			CTSH1Open = 0;
		}

		smallPlaylist.show();
		smallPlaylist.setTargetX(246);
		smallPlaylist.setTargetY(0);
		smallPlaylist.setTargetSpeed(1);
		smallPlaylist.gotoTarget();
		ShadePLOpen = 1;
	}
}

OpenCloseShadeConfig() {
	if (ShadeConfigOpen) {
		ConfigShadeDrawer.setTargetX(514);
		ConfigShadeDrawer.setTargetY(-44);
		ConfigShadeDrawer.setTargetSpeed(1);
		ConfigShadeDrawer.gotoTarget();
		ShadeConfigOpen = 0;

	} else {
		ConfigShadeDrawer.setTargetX(514);
		ConfigShadeDrawer.setTargetY(22);
		ConfigShadeDrawer.setTargetSpeed(1);
		ConfigShadeDrawer.gotoTarget();
		ShadeConfigOpen = 1;

	}
}

PrepareShadeDrawer(String i) {

	if (i=="sConfig" && shadeDrawerIsReady) {
		shadeDrawerIsReady=0;

		if (ShadeEQOpen) {
			OpenCloseShadeEQ();
			nextshadeopen="sConfig";
		} else {

			if (ShadeThingerOpen) {
				OpenCloseShadeThinger();
				nextshadeopen="sConfig";
			} else {
				OpenCloseShadeConfig();
				nextshadeopen="";
			}
		}

	}


	if (i=="sThinger" && shadeDrawerIsReady) {
		shadeDrawerIsReady=0;
		if (ShadeEQOpen) {
			OpenCloseShadeEQ();
			nextshadeopen="sThinger";
		} else {

			if (ShadeConfigOpen) {
				OpenCloseShadeConfig();
				nextshadeopen="sThinger";
			} else {
				OpenCloseShadeThinger();
				nextshadeopen="";
			}
		}
	}

	if (i=="sEQ" && shadeDrawerIsReady) {
		shadeDrawerIsReady=0;
		if (ShadeConfigOpen) {
			OpenCloseShadeConfig();
			nextshadeopen="sEQ";
		} else {

			if (ShadeThingerOpen) {
				OpenCloseShadeThinger();
				nextshadeopen="sEQ";
			} else {
				OpenCloseShadeEQ();
				nextshadeopen="";
			}
		}
	}

}



checkshadenext() {
	if (nextshadeopen=="pl") { nextshadeopen=""; OpenCloseShadePL();}
	if (nextshadeopen=="sThinger") { nextshadeopen=""; OpenCloseShadeThinger();}
	if (nextshadeopen=="sEQ") { nextshadeopen="";OpenCloseShadeEQ();}
	if (nextshadeopen=="sConfig") { nextshadeopen="";OpenCloseShadeConfig();}
}




smallPlaylist.onTargetReached() {
	shadeDrawerIsReady=1;
	checkshadenext();
	if (!ShadePLOpen) smallPlaylist.hide();
}

EQShadeDrawer.onTargetReached() {
	shadeDrawerIsReady=1;
	ButtonShadeEQ.setActivated(ShadeEQOpen);
	checkshadenext();
}


ThingerShadeDrawer.onTargetReached() {
	shadeDrawerIsReady=1;
	ButtonShadeThinger.setActivated(ShadeThingerOpen);
	checkshadenext();
}


ConfigShadeDrawer.onTargetReached() {
	shadeDrawerIsReady=1;
	ButtonShadeConfig.setActivated(ShadeConfigOpen);
	checkshadenext();
}


mainContainer.onSwitchToLayout(Layout newlayout) {

	int x1,y1;

	if (newlayout == mainshade) {

		int aotws = getPrivateInt("MMD3", "aotmode", 1);
		int aotws2 = baot1.getActivated();

		if ( getPrivateInt("MMD3", "LASTMODE", 0) == 0 ) setPrivateInt("MMD3", "lastaotnormal", aotws2);

		if (aotws==1 && aotws2==0) baot1.leftClick();

		refreshEQ.stop();

		if (lastshademode==2) {
			x1=mainshade2.getLeft();
			y1=mainshade2.getTop();
			setPrivateInt("MMD3", "s2lastx", x1);
			setPrivateInt("MMD3", "s2lasty", y1);
		} else {
			x1=dummynormal.getLeft();
			y1=dummynormal.getTop();
			setPrivateInt("MMD3", "wlastx", x1);
			setPrivateInt("MMD3", "wlasty", y1);
		}

		setPrivateInt("MMD3", "LASTMODE", 1);

		x1=getPrivateInt("MMD3", "slastx", 0);
		y1=getPrivateInt("MMD3", "slasty", 3333);

		SetLastShadeMode(1);

		if (y1==3333) {
			x1=getViewportLeft()+16;
			y1=getViewportTop();
		}

		if ( y1<getViewportTop() ) y1=getViewportTop();
		if ( x1<getViewportLeft() ) x1=getViewportLeft();

		mainshade.resize(x1,y1,mainshade.getwidth(),mainshade.getheight());
	}

	if (newlayout == mainshade2) {

		int aotws = getPrivateInt("MMD3", "aotmode", 1);
		int aotws2 = baot1.getActivated();

		if ( getPrivateInt("MMD3", "LASTMODE", 0) == 0 ) setPrivateInt("MMD3", "lastaotnormal", aotws2);

		if (aotws==1 && aotws2==0) baot1.leftClick();

		refreshEQ.stop();

		if (lastshademode==1) {
			x1=mainshade.getLeft();
			y1=mainshade.getTop();
			setPrivateInt("MMD3", "slastx", x1);
			setPrivateInt("MMD3", "slasty", y1);
		} else {
			x1=dummynormal.getLeft();
			y1=dummynormal.getTop();
			setPrivateInt("MMD3", "wlastx", x1);
			setPrivateInt("MMD3", "wlasty", y1);
		}

		setPrivateInt("MMD3", "LASTMODE", 2);

		SetLastShadeMode(2);

		x1=getPrivateInt("MMD3", "s2lastx", 0);
		y1=getPrivateInt("MMD3", "s2lasty", 3333);

		if (y1==3333) {
			x1=getViewportLeft();
			y1=getViewportTop();
		}

		if ( y1<getViewportTop() ) y1=getViewportTop();
		if ( x1<getViewportLeft() ) x1=getViewportLeft();

		mainshade2.resize(x1,y1,mainshade2.getwidth(),mainshade2.getheight());
	}

	if (newlayout == dummynormal) {

		int aotws = getPrivateInt("MMD3", "lastaotnormal", 0);
		int aotws2 = baot1.getActivated();

		if (aotws==0 && aotws2==1) baot1.leftClick();

		int activevis= getPrivateInt("MMD3", "AVISMODE", 1);
		if (activevis<=6) refreshEQ.start();

		if (lastshademode==1) {
			x1=mainshade.getLeft();
			y1=mainshade.getTop();
			setPrivateInt("MMD3", "slastx", x1);
			setPrivateInt("MMD3", "slasty", y1);
		}

		if (lastshademode==2) {
			x1=mainshade2.getLeft();
			y1=mainshade2.getTop();
			setPrivateInt("MMD3", "s2lastx", x1);
			setPrivateInt("MMD3", "s2lasty", y1);
		}

		setPrivateInt("MMD3", "LASTMODE", 0);

		x1=getPrivateInt("MMD3", "wlastx", 200);
		y1=getPrivateInt("MMD3", "wlasty", 200);
		dummynormal.resize(x1,y1,dummynormal.getwidth(),dummynormal.getheight());
	}
}


baot2.onLeftButtonUp(int x, int y) {
	int aotws2 = baot1.getActivated();
	int acti=baot2.getActivated();
	baot3.setActivated(acti);
	setPrivateInt("MMD3", "aotmode", acti);

	if (acti==1 && aotws2==0) baot1.leftClick();
	if (acti==0 && aotws2==1) baot1.leftClick();

}

baot3.onLeftButtonUp(int x, int y) {
	int aotws2 = baot1.getActivated();
	int acti=baot3.getActivated();
	baot2.setActivated(acti);
	setPrivateInt("MMD3", "aotmode", acti);

	if (acti==1 && aotws2==0) baot1.leftClick();
	if (acti==0 && aotws2==1) baot1.leftClick();

}


SetLastShadeMode(int mode) {
	setPrivateInt("MMD3", "lastshademode", mode);
	lastshademode=mode;

	if (mode==1) {
		tickerMenu.checkCommand(30, 1);
		tickerMenu.checkCommand(31, 0);
		Switcher1.setXMLParam("dblClickAction", "SWITCH;shade");
		Switcher2.setXMLParam("param", "shade");
		Switcher3.setXMLParam("dblClickAction", "SWITCH;shade");

	}
	if (mode==2) {
		tickerMenu.checkCommand(30, 0);
		tickerMenu.checkCommand(31, 1);
		Switcher1.setXMLParam("dblClickAction", "SWITCH;shade2");
		Switcher2.setXMLParam("param", "shade2");
		Switcher3.setXMLParam("dblClickAction", "SWITCH;shade2");

	}
}


// Open Songinfo on DoubleClick
Songticker.onLeftButtonDblClk(Int intX, Int intY) {
	SongInfoEditor.leftClick();
}
SongTickerShade2.onLeftButtonDblClk(Int intX, Int intY) {
	SongInfoEditor.leftClick();
}


// Open MiniPlaylist
SongTickerShade.onLeftButtonUp(int x, int y) {
	OpenCloseShadePL();
}


// a little bit glowing for the Mainbuttons

Play.onEnterArea() {
	startglow();
}

Play.onLeaveArea() {
	stopglow();
}

Pause.onEnterArea() {
	startglow();
}

Pause.onLeaveArea() {
	stopglow();
}

Stop.onEnterArea() {
	startglow();
}

Stop.onLeaveArea() {
	stopglow();
}

Next.onEnterArea() {
	startglow();
}

Next.onLeaveArea() {
	stopglow();
}

Previous.onEnterArea() {
	startglow();
}

Previous.onLeaveArea() {
	stopglow();
}

startglow() {
	glowtimer.stop();
	glowtimer.start();
	glow_delta=70;
}

stopglow() {
	glowtimer.stop();
	glowtimer.start();
	glow_delta=-20;
}

glowtimer.ontimer() {

	glowing=glowing+glow_delta;

	if (glowing>=250) {
		glowing=250;
		glowtimer.stop();
	}

	if (glowing<=0) {
		glowing=0;
		glowtimer.stop();
	}

	glow.setAlpha(glowing);

}




// EQ/VIS Drawer/Advanced Visualization
//--------------------------------------------------------------------
autobutton.onActivate(int act) {
	if (act==1) AutoLED.show();
	if (act==0) AutoLED.hide();
}

EQPush.onLeftClick() {
	PrepareDrawer("EQ");
}

EQPush2.onLeftClick() {
	PrepareDrawer("EQ");
}

EQPush2b.onLeftClick() {
	PrepareDrawer("EQ");
}

EQPush3.onLeftClick() {
	PrepareDrawer("EQ");
}

VISPush.onLeftClick() {
	PrepareDrawer("VIS");
}

VISPush2.onLeftClick() {
	PrepareDrawer("VIS");
}

VISPush2b.onLeftClick() {
	PrepareDrawer("VIS");
}

VISPush3.onLeftClick() {
	PrepareDrawer("VIS");
}

CTPush.onLeftClick() {
	PrepareDrawer("CT");
}

CTPush2.onLeftClick() {
	PrepareDrawer("CT");
}

CTPush2b.onLeftClick() {
	PrepareDrawer("CT");
}

CTPush3.onLeftClick() {
	PrepareDrawer("CT");
}



PrepareDrawer(String i) {

	CTList.hide();

	if (i=="CT" && DrawerIsReady) {
		DrawerIsReady=0;

		if (isEQOpen) {
			OpenCloseEQ();
			nextopen="CT";
		} else {

			if (isVISOpen) {
				OpenCloseVIS();
				nextopen="CT";
			} else {
				OpenCloseCT();
				nextopen="";
			}
		}

	}


	if (i=="VIS" && DrawerIsReady) {
		DrawerIsReady=0;
		if (isEQOpen) {
			OpenCloseEQ();
			nextopen="VIS";
		} else {

			if (isCTOpen) {
				OpenCloseCT();
				nextopen="VIS";
			} else {
				OpenCloseVIS();
				nextopen="";
			}
		}
	}

	if (i=="EQ" && DrawerIsReady) {
		DrawerIsReady=0;
		if (isVISOpen) {
			OpenCloseVIS();
			nextopen="EQ";
		} else {

			if (isCTOpen) {
				OpenCloseCT();
				nextopen="EQ";
			} else {
				OpenCloseEQ();
				nextopen="";
			}
		}
	}

}


system.onEqChanged(int onoff) {
	if ( onoff ) {
		OnOffLED.show();
	} else {
		OnOffLED.hide();
	}
}



EQDrawer.onTargetReached() {
	DrawerIsReady=1;
	if (!isEQOpen) OnOffLayer.show();
	checknext();
}


VISDrawer.onTargetReached() {
	DrawerIsReady=1;
	if (!isVISOpen) OnOffLayer.show();
	checknext();
}

checknext() {
	if (nextopen=="CT") { nextopen=""; OpenCloseCT();}
	if (nextopen=="EQ") { nextopen="";OpenCloseEQ();}
	if (nextopen=="VIS") { nextopen="";OpenCloseVIS();}
}



CTDrawer.onTargetReached() {
	DrawerIsReady=1;
	if (!isCTOpen) {
		OnOffLayer.show();
		CTLayer.hide();
	}

	if (isCTOpen && nextopen=="") CTList.show();
	checknext();
}


OpenCloseEQ() {
	EQDrawer.show();
	CTLayer.hide();
	CTDrawer.hide();
	VISDrawer.hide();
	if (isEQOpen == 1) {
		setSuperText("CLOSE DRAWER");
		EQDrawer.setTargetX(EQCTVISDrawer_x_start);
		EQDrawer.setTargetY(22);
		EQDrawer.setTargetSpeed(1);
		EQDrawer.gotoTarget();
		isEQOpen = 0;
	} else {
		setSuperText("OPEN DRAWER");
		EQDrawer.setTargetX(EQCTVISDrawer_x_end);
		EQDrawer.setTargetY(22);
		EQDrawer.setTargetSpeed(1);
		EQDrawer.gotoTarget();
		OnOffLayer.hide();
		isEQOpen = 1;
	}
}



OpenCloseCT() {
	CTLayer.show();
	CTDrawer.show();
	if (isCTOpen == 1) {
		setSuperText("CLOSE DRAWER");
		CTDrawer.setTargetX(EQCTVISDrawer_x_start);
		CTDrawer.setTargetY(22);
		CTDrawer.setTargetSpeed(1);
		CTDrawer.gotoTarget();
		isCTOpen = 0;
	} else {
		setSuperText("OPEN DRAWER");
		CTDrawer.setTargetX(EQCTVISDrawer_x_end);
		CTDrawer.setTargetY(22);
		CTDrawer.setTargetSpeed(1);
		CTDrawer.gotoTarget();
		OnOffLayer.hide();
		isCTOpen = 1;
	}
}


OpenCloseVIS() {
	VISDrawer.show();
	CTLayer.hide();
	CTDrawer.hide();
	EQDrawer.hide();
	if (isVISOpen == 1) {
		setSuperText("CLOSE DRAWER");
		VISDrawer.setTargetX(EQCTVISDrawer_x_start);
		VISDrawer.setTargetY(22);
		VISDrawer.setTargetSpeed(1);
		VISDrawer.gotoTarget();
		isVISOpen = 0;
	} else {
		setSuperText("OPEN DRAWER");
		VISDrawer.setTargetX(EQCTVISDrawer_x_end);
		VISDrawer.setTargetY(22);
		VISDrawer.setTargetSpeed(1);
		VISDrawer.gotoTarget();
		OnOffLayer.hide();
		isVISOpen = 1;
	}

}


vb1.onLeftClick() {
	ShowVISBg(1);
}

vb2.onLeftClick() {
	ShowVISBg(2);
}

vb3.onLeftClick() {
	ShowVISBg(3);
}

vb4.onLeftClick() {
	ShowVISBg(4);
}

vb5.onLeftClick() {
	ShowVISBg(5);
}

vb6.onLeftClick() {
	ShowVISBg(6);
}

vb7.onLeftClick() {
	ShowVISBg(7);
}

vb8.onLeftClick() {
	ShowVISBg(8);
}

vb9.onLeftClick() {
	ShowVISBg(9);
}


ShowVISBg(int i) {

	if (i>6) {
		dis1.show();
		if (i==7) {
			dis3.hide();
			dis2.hide();
			dis4.hide();
			normalVIS.setMode(3);
		}
		if (i==8) {
			dis2.show();
			dis3.hide();
			dis4.hide();
			normalVIS.setMode(1);
		}
		if (i==9) {
			dis3.show();
			dis2.hide();
			dis4.hide();
			normalVIS.setMode(2);
		}
		disani.hide();

		refreshEQ.stop();



	} else {
		normalVIS.setMode(3);
		dis1.hide();
		dis2.hide();
		dis3.show();
		dis4.show();
		disani.show();

		if (i==1) {
			disani.setXMLParam("image", "player.vis.ani1");
			avdelta=4;
		}

		if (i==2) {
			disani.setXMLParam("image", "player.vis.ani2");
			avdelta=2;
		}

		if (i==3) {
			disani.setXMLParam("image", "player.vis.ani3");
			avdelta=4;
		}

		if (i==4) {
			disani.setXMLParam("image", "player.vis.ani4");
			avdelta=2;
		}

		if (i==5) {
			disani.setXMLParam("image", "player.vis.ani5");
			avdelta=3;
		}


		if (i==6) {
			disani.setXMLParam("image", "player.vis.ani6");
			avdelta=3;
		}


		refreshEQ.stop();
		refreshEQ.start();

	}

	SetPrivateInt("MMD3", "AVISMODE", i);
	SetLEDVISMode(i);
}


VISHint.onLeftClick() {
	showHint();
	VISMode = getPrivateInt("MMD3", "AVISMODE", 8);
	VISMode++;
	if (VISMode>9) VISMode=1;
	ShowVISBg(VISMode);
}


showHint() {
	HintFadeCounter = 250;
	HintFadeTimer.start();
}

HintFadeTimer.onTimer() {

	VISHint.setAlpha(HintFadeCounter);

	if (HintFadeCounter<=0) {
		HintFadeTimer.stop();
		VISHint.setAlpha(0);
	}

	HintFadeCounter-=25;

}

SetLEDVISMode(int mode) {

	l1.setAlpha(0);
	l2.setAlpha(0);
	l3.setAlpha(0);
	l4.setAlpha(0);
	l5.setAlpha(0);
	l6.setAlpha(0);
	l7.setAlpha(0);
	l8.setAlpha(0);
	l9.setAlpha(0);

	if (mode==1) l1.setAlpha(255);
	if (mode==2) l2.setAlpha(255);
	if (mode==3) l3.setAlpha(255);
	if (mode==4) l4.setAlpha(255);
	if (mode==5) l5.setAlpha(255);
	if (mode==6) l6.setAlpha(255);
	if (mode==7) l7.setAlpha(255);
	if (mode==8) l8.setAlpha(255);
	if (mode==9) l9.setAlpha(255);
}


refreshEQ.onTimer() {
	int vu;

	vu= (System.getLeftVuMeter() + System.getRightVuMeter() ) / 2 ;

	if (vu>maxVu) maxVu=vu;
	if (maxVu==0) maxVu=1;
	int k = vu/maxVu*29;

	if (k<lastk) {
		k=lastk-avdelta;
		if (k<0) k=0;
	}
	lastk=k;

	disani.gotoframe(k);

	VuLoop++;
	if (VuLoop>200) {
		maxVu=maxVu/2;
		lastk=0;
		VuLoop=0;
	}

}

slidercb.onSetPosition(int val) {
	String s = IntegerToString(val);
	fadertext.setText(s);
}



// Songticker Menu
//--------------------------------------------------------------------
MakeSongtickerMenu() {


	tickerMenu = new PopupMenu;
	tickerMenu.addCommand("Songticker Scrolling (on)", 1, 0, 0);
	tickerMenu.addCommand("Songticker Scrolling (off)", 2, 0, 0);
	tickerMenu.addSeparator();
	tickerMenu.addCommand("Fontsize large", 3, 0, 0);
	tickerMenu.addCommand("Fontsize medium", 4, 0, 0);
	tickerMenu.addCommand("Fontsize small", 5, 0, 0);
	tickerMenu.addSeparator();

	tickerMenu.addCommand("drawers: right", 20, 0, 0);
	tickerMenu.addCommand("drawers: left", 21, 0, 0);
	tickerMenu.addSeparator();

	tickerMenu.addCommand("default winshade: horizontal", 30, 0, 0);
	tickerMenu.addCommand("default winshade: vertical", 31, 0, 0);
	tickerMenu.addSeparator();
	tickerMenu.addCommand("volume/bass/treble LED: on", 50, 0, 0);
	tickerMenu.addCommand("volume/bass/treble LED: off", 51, 0, 0);
	tickerMenu.addSeparator();
	tickerMenu.addCommand("ColorThemes...", 40, 0, 0);



}

configbutton.onleftclick() {
	setSuperText("CONFIGURATION");
	ProcessMenuResult(tickerMenu.popAtMouse());
	complete;
}

configbutton.onrightclick() {
	ProcessMenuResult(tickerMenu.popAtMouse());
	complete;
}

ProcessMenuResult(int a) {
	if(a > 0) {
		if(a == 1) {
			Songticker.setXMLParam("ticker", "1");
			ToggleScroll.setActivated(1);
			ToggleScroll2.setActivated(1);
			SongTickerShade.setXMLParam("ticker", "1");
			SongTickerShade2.setXMLParam("ticker", "1");
			tickerMenu.checkCommand(1, 1);
			tickerMenu.checkCommand(2, 0);
			setPrivateInt("MMD3", "scrollticker", 1);
		}

		if(a == 2) {
			Songticker.setXMLParam("ticker", "0");
			ToggleScroll.setActivated(0);
			ToggleScroll2.setActivated(0);
			SongTickerShade.setXMLParam("ticker", "0");
			SongTickerShade2.setXMLParam("ticker", "0");
			tickerMenu.checkCommand(1, 0);
			tickerMenu.checkCommand(2, 1);
			setPrivateInt("MMD3", "scrollticker", 2);
		}

		if(a == 3) {
			Songticker.setXMLParam("font", "player.ticker.font");
			Supertext.setXMLParam("font", "player.ticker.font");
			tickerMenu.checkCommand(3, 1);
			tickerMenu.checkCommand(4, 0);
			tickerMenu.checkCommand(5, 0);
			setPrivateInt("MMD3", "scrolltickersize", 3);
		}

		if(a == 4) {
			Songticker.setXMLParam("font", "player.ticker.font2");
			Supertext.setXMLParam("font", "player.ticker.font2");
			tickerMenu.checkCommand(3, 0);
			tickerMenu.checkCommand(4, 1);
			tickerMenu.checkCommand(5, 0);
			setPrivateInt("MMD3", "scrolltickersize", 4);
		}

		if(a == 5) {
			Songticker.setXMLParam("font", "player.ticker.font3");
			Supertext.setXMLParam("font", "player.ticker.font3");
			tickerMenu.checkCommand(3, 0);
			tickerMenu.checkCommand(4, 0);
			tickerMenu.checkCommand(5, 1);
			setPrivateInt("MMD3", "scrolltickersize", 5);
		}

		if ( a<=5 )

			Songtickertimer.stop();
			Songticker.setAlternateText("updating songticker");
			Songtickertimer.start();

		if(a == 20) {
			setPrivateInt("MMD3", "LeftRightMode", 0);
			tickerMenu.checkCommand(20, 1);
			tickerMenu.checkCommand(21, 0);
			setLeftRightMode(0);
		}

		if(a == 21) {
			setPrivateInt("MMD3", "LeftRightMode", 1);
			tickerMenu.checkCommand(20, 0);
			tickerMenu.checkCommand(21, 1);
			setLeftRightMode(1);
		}

		if(a == 30) {
			SetLastShadeMode(1);
		}

		if(a == 31) {
			SetLastShadeMode(2);
		}

		if(a == 40) {
			container cts=getContainer("ctsbig");
			cts.show();
		}

		if(a == 50) {
			VolumeLED.show();
			BassLED.show();
			TrebleLED.show();
			setPrivateInt("MMD3", "knobLED", 0);
			tickerMenu.checkCommand(50, 1);
			tickerMenu.checkCommand(51, 0);
		}

		if(a == 51) {
			VolumeLED.hide();
			BassLED.hide();
			TrebleLED.hide();
			setPrivateInt("MMD3", "knobLED", 1);
			tickerMenu.checkCommand(50, 0);
			tickerMenu.checkCommand(51, 1);
		}

	}
}


ToggleScroll.onToggle(int a) {
	if(a == 1) {
		ToggleScroll2.setActivated(1);
		Songticker.setXMLParam("ticker", "1");
		SongTickerShade.setXMLParam("ticker", "1");
		SongTickerShade2.setXMLParam("ticker", "1");
		tickerMenu.checkCommand(1, 1);
		tickerMenu.checkCommand(2, 0);
		setPrivateInt("MMD3", "scrollticker", 1);
	}
	if(a == 0) {
		ToggleScroll2.setActivated(0);
		Songticker.setXMLParam("ticker", "0");
		SongTickerShade.setXMLParam("ticker", "0");
		SongTickerShade2.setXMLParam("ticker", "0");
		tickerMenu.checkCommand(1, 0);
		tickerMenu.checkCommand(2, 1);
		setPrivateInt("MMD3", "scrollticker", 2);
	}

}

ToggleScroll2.onToggle(int a) {
	if(a == 1) {
		ToggleScroll.setActivated(1);
		Songticker.setXMLParam("ticker", "1");
		SongTickerShade.setXMLParam("ticker", "1");
		SongTickerShade2.setXMLParam("ticker", "1");
		tickerMenu.checkCommand(1, 1);
		tickerMenu.checkCommand(2, 0);
		setPrivateInt("MMD3", "scrollticker", 1);
	}
	if(a == 0) {
		ToggleScroll.setActivated(0);
		Songticker.setXMLParam("ticker", "0");
		SongTickerShade.setXMLParam("ticker", "0");
		SongTickerShade2.setXMLParam("ticker", "0");
		tickerMenu.checkCommand(1, 0);
		tickerMenu.checkCommand(2, 1);
		setPrivateInt("MMD3", "scrollticker", 2);
	}

}



setLeftRightMode(int i) {
	Layer dummy1=dummynormal.getObject("playeroverlay");
	togglebutton dummy2=mainnormal.getObject("Repeat");
	togglebutton dummy3=mainnormal.getObject("Shuffle");
	togglebutton dummy4=mainnormal.getObject("Crossfade");
	button dummy5=mainnormal.getObject("EJECT");
	Layer dummy6=mainnormal.getObject("label8");
	Layer dummy7=mainnormal.getObject("label1");
	Layer dummy8=mainnormal.getObject("CrossfadeLed");
	Layer dummy9=mainnormal.getObject("ShuffleLed");
	Layer dummy10=mainnormal.getObject("RepeatLed");

	group dummy11=dummynormal.getObject("onofflayer");

	button dummy12=dummy11.getObject("eqtoggle");
	button dummy13=dummy11.getObject("visdtoggle");
	button dummy14=dummy11.getObject("cttoggle");

	button dummy15=mainnormal.getObject("maincfg");
	Layer dummy16=mainnormal.getObject("label13");

	button dummyvisbbg1=VISDrawer.getObject("visbbg1");
	button dummyvisbbg2=VISDrawer.getObject("visbbg2");
	button dummyvisbbg3=VISDrawer.getObject("visbbg3");
	button dummyvisbbg4=VISDrawer.getObject("visbbg4");
	button dummyvisbbg5=VISDrawer.getObject("visbbg5");
	button dummyvisbbg6=VISDrawer.getObject("visbbg6");
	button dummyvisbfg1=VISDrawer.getObject("visbfg1");
	button dummyvisbfg2=VISDrawer.getObject("visbfg2");
	button dummyvisbfg3=VISDrawer.getObject("visbfg3");

	layer dummyvled1=VISDrawer.getObject( "vled1" );
	layer dummyvled2=VISDrawer.getObject( "vled2" );
	layer dummyvled3=VISDrawer.getObject( "vled3" );
	layer dummyvled4=VISDrawer.getObject( "vled4" );
	layer dummyvled5=VISDrawer.getObject( "vled5" );
	layer dummyvled6=VISDrawer.getObject( "vled6" );
	layer dummyvled7=VISDrawer.getObject( "vled7" );
	layer dummyvled8=VISDrawer.getObject( "vled8" );
	layer dummyvled9=VISDrawer.getObject( "vled9" );
  	layer dummylabel4=VISDrawer.getObject("label4");
  	layer dummylabel5=VISDrawer.getObject("label5");
  	layer dummylabel9=VISDrawer.getObject("label9");

  	button dummyvisdtoggle2=VISDrawer.getObject("visdtoggle2");
  	button dummyeqtoggle2b=VISDrawer.getObject("eqtoggle2b");
  	button dummycttoggle2b=VISDrawer.getObject("cttoggle2b");

	layer dummylabel6=EQDrawer.getObject("label6");
	layer dummylabel7=EQDrawer.getObject("label7");
	layer dummycfdisplaybg=EQDrawer.getObject("cfdisplaybg");
	layer dummycfdisplaybgoverlay=EQDrawer.getObject("cfdisplaybgoverlay");
	layer dummyeqonoffLed=EQDrawer.getObject("eqonoffLed");
	layer dummyeqautoLed=EQDrawer.getObject("eqautoLed");

	slider dummypreamp=EQDrawer.getObject("preamp");
	slider dummyeq1=EQDrawer.getObject("eq1");
	slider dummyeq2=EQDrawer.getObject("eq2");
	slider dummyeq3=EQDrawer.getObject("eq3");
	slider dummyeq4=EQDrawer.getObject("eq4");
	slider dummyeq5=EQDrawer.getObject("eq5");
	slider dummyeq6=EQDrawer.getObject("eq6");
	slider dummyeq7=EQDrawer.getObject("eq7");
	slider dummyeq8=EQDrawer.getObject("eq8");
	slider dummyeq9=EQDrawer.getObject("eq9");
	slider dummyeq10=EQDrawer.getObject("eq10");
	slider dummybalance=EQDrawer.getObject("balance");
	slider dummysCrossfade=EQDrawer.getObject("sCrossfade");

	text dummycftext=EQDrawer.getObject("cftext");
	button dummyeqtoggle2=EQDrawer.getObject("eqtoggle2");
	button dummyvisdtoggle2b=EQDrawer.getObject("visdtoggle2b");
	button dummycttoggle2=EQDrawer.getObject("cttoggle2");
	button dummyeqonoff=EQDrawer.getObject("eqonoff");
	button dummyeqauto=EQDrawer.getObject("eqauto");
	button dummyeqpresets=EQDrawer.getObject("eqpresets");

	button dummy17=CTDrawer.getObject("ctbig");
	button dummy18=CTDrawer.getObject("cttoggle3");

	layer dummy19=CTDrawer.getObject("label10");
	layer dummy20=CTDrawer.getObject("label14");

	layer dummy21=CTDrawer.getObject("mcd1");
	layer dummy22=CTDrawer.getObject("mcd2");
	layer dummy23=CTDrawer.getObject("mcd3");
	layer dummy24=CTDrawer.getObject("mcd4");

	button dummy25=CTList.getObject("switch");


	if (i==0) { 	// left
		mainnormal.setXMLParam("x", "0");
		dummy1.setXMLParam("x", "0");
		dummy1.setXMLParam("image", "player.bgbase.overlay");
		dummy2.setXMLParam("x", "15");
		dummy2.setXMLParam("y", "80");
		dummy3.setXMLParam("x", "11");
		dummy3.setXMLParam("y", "55");
		dummy4.setXMLParam("x", "9");
		dummy4.setXMLParam("y", "30");
		dummy5.setXMLParam("x", "7");
		dummy5.setXMLParam("y", "181");
		dummy6.setXMLParam("x", "297");
		dummy7.setXMLParam("x", "42");
		dummy7.setXMLParam("y", "200");
		dummy8.setXMLParam("x", "28");
		dummy8.setXMLParam("y", "35");
		dummy9.setXMLParam("x", "30");
		dummy9.setXMLParam("y", "58");
		dummy10.setXMLParam("x", "34");
		dummy10.setXMLParam("y", "80");
		dummy11.setXMLParam("x", "347");
		dummy11.setXMLParam("background", "player.eq.buttonoverlay");

		dummy12.setXMLParam("x", "8");
		dummy12.setXMLParam("image", "player.button.eqs");
		dummy12.setXMLParam("downimage", "player.button.eqs.down");
		dummy13.setXMLParam("x", "8");
		dummy13.setXMLParam("image", "player.button.viss");
		dummy13.setXMLParam("downimage", "player.button.viss.down");
		dummy14.setXMLParam("x", "12");
		dummy14.setXMLParam("image", "player.button.ct");
		dummy14.setXMLParam("downimage", "player.button.ct.down");

		dummy15.setXMLParam("x", "5");
		dummy15.setXMLParam("y", "125");
		dummy16.setXMLParam("x", "7");
		dummy16.setXMLParam("y", "144");

		dummy17.setXMLParam("x", "186");

		dummy18.setXMLParam("x", "210");
		dummy18.setXMLParam("image", "player.button.ct2");
		dummy18.setXMLParam("downimage", "player.button.ct2.down");

		dummy19.setXMLParam("x", "40");
		dummy20.setXMLParam("x", "67");

		dummy21.setXMLParam("x", "43");
		dummy22.setXMLParam("x", "43");
		dummy23.setXMLParam("x", "101");
		dummy24.setXMLParam("x", "177");

		dummyvisbbg1.setXMLParam("x", "28");
		dummyvisbbg2.setXMLParam("x", "68");
		dummyvisbbg3.setXMLParam("x", "28");
		dummyvisbbg4.setXMLParam("x", "68");
		dummyvisbbg5.setXMLParam("x", "28");
		dummyvisbbg6.setXMLParam("x", "68");
		dummyvisbfg1.setXMLParam("x", "148");
		dummyvisbfg2.setXMLParam("x", "148");
		dummyvisbfg3.setXMLParam("x", "148");

		dummyvled1.setXMLParam("x", "12");
		dummyvled2.setXMLParam("x", "100");
		dummyvled3.setXMLParam("x", "12");
		dummyvled4.setXMLParam("x", "100");
		dummyvled5.setXMLParam("x", "12");
		dummyvled6.setXMLParam("x", "100");
		dummyvled7.setXMLParam("x", "132");
		dummyvled8.setXMLParam("x", "132");
		dummyvled9.setXMLParam("x", "132");
		dummylabel4.setXMLParam("x", "48");
		dummylabel5.setXMLParam("x", "147");
		dummylabel9.setXMLParam("x", "41");

		dummyvisdtoggle2.setXMLParam("x", "206");
		dummyvisdtoggle2.setXMLParam("image", "player.button.viss2");
		dummyvisdtoggle2.setXMLParam("downimage", "player.button.viss2.down");

		dummyeqtoggle2b.setXMLParam("x", "206");
		dummyeqtoggle2b.setXMLParam("image", "player.button.eqs");
		dummyeqtoggle2b.setXMLParam("downimage", "player.button.eqs.down");

		dummycttoggle2b.setXMLParam("x", "210");
		dummycttoggle2b.setXMLParam("image", "player.button.ct");
		dummycttoggle2b.setXMLParam("downimage", "player.button.ct.down");

		EQCTVISDrawer_x_start=149;
		EQCTVISDrawer_x_end=350;

		VISDrawer.setXMLParam("background", "player.visd.bg");

		EQDrawer.setXMLParam("background", "player.eq.bg");

		dummylabel6.setXMLParam("x", "9");
		dummylabel6.setXMLParam("image", "player.textlabel6");

		dummylabel7.setXMLParam("x", "51");
		dummycfdisplaybg.setXMLParam("x", "178");
		dummycfdisplaybgoverlay.setXMLParam("x", "178");
		dummyeqonoffLed.setXMLParam("x", "63");
		dummyeqautoLed.setXMLParam("x", "121");

		dummypreamp.setXMLParam("x", "13");
		dummyeq1.setXMLParam("x", "52");
		dummyeq2.setXMLParam("x", "66");
		dummyeq3.setXMLParam("x", "80");
		dummyeq4.setXMLParam("x", "94");
		dummyeq5.setXMLParam("x", "108");
		dummyeq6.setXMLParam("x", "122");
		dummyeq7.setXMLParam("x", "136");
		dummyeq8.setXMLParam("x", "150");
		dummyeq9.setXMLParam("x", "164");
		dummyeq10.setXMLParam("x", "178");
		dummybalance.setXMLParam("x", "50");
		dummysCrossfade.setXMLParam("x", "127");

		dummycftext.setXMLParam("x", "179");

		dummyeqtoggle2.setXMLParam("x", "206");
		dummyeqtoggle2.setXMLParam("image", "player.button.eqs2");
		dummyeqtoggle2.setXMLParam("downimage", "player.button.eqs2.down");

		dummyvisdtoggle2b.setXMLParam("x", "206");
		dummyvisdtoggle2b.setXMLParam("image", "player.button.viss");
		dummyvisdtoggle2b.setXMLParam("downimage", "player.button.viss.down");

		dummycttoggle2.setXMLParam("x", "210");
		dummycttoggle2.setXMLParam("image", "player.button.ct");
		dummycttoggle2.setXMLParam("downimage", "player.button.ct.down");

		dummyeqonoff.setXMLParam("x", "44");
		dummyeqauto.setXMLParam("x", "91");
		dummyeqpresets.setXMLParam("x", "149");


		if (isEQOpen == 1) {
			EQDrawer.setXMLParam("x", "349");
		} else {
			EQDrawer.setXMLParam("x", "149");
		}

		if (isVISOpen == 1) {
			VISDrawer.setXMLParam("x", "349");
		} else {
			VISDrawer.setXMLParam("x", "149");
		}

		if (isCTOpen == 1) {
			CTDrawer.setXMLParam("x", "349");
		} else {
			CTDrawer.setXMLParam("x", "149");
		}

		CTList.setXMLParam("x", "392");
		CTList.setXMLParam("background", "player.ct.listbg");
		CTDrawer.setXMLParam("background", "player.ct.bg");

		CTLayer.setXMLParam("x", "350");
		CTLayer.setXMLParam("background", "player.ct.overlay");

		dummy25.setXMLParam("x", "134");

		EQPush3.setXMLParam("x", "5");
		EQPush3.setXMLParam("image", "player.button.eqs");
		EQPush3.setXMLParam("downimage", "player.button.eqs.down");
		VISPush3.setXMLParam("x", "5");
		VISPush3.setXMLParam("image", "player.button.viss");
		VISPush3.setXMLParam("downimage", "player.button.viss.down");



	}

	if (i==1) { 	// right
		mainnormal.setXMLParam("x", "202");
		dummy1.setXMLParam("x", "202");
		dummy1.setXMLParam("image", "player.bgbase.overlayx");
		dummy2.setXMLParam("x", "346");
		dummy2.setXMLParam("y", "92");
		dummy3.setXMLParam("x", "350");
		dummy3.setXMLParam("y", "67");
		dummy4.setXMLParam("x", "352");
		dummy4.setXMLParam("y", "42");
		dummy5.setXMLParam("x", "345");
		dummy5.setXMLParam("y", "179");
		dummy6.setXMLParam("x", "13");
		dummy7.setXMLParam("x", "322");
		dummy7.setXMLParam("y", "201");
		dummy8.setXMLParam("x", "337");
		dummy8.setXMLParam("y", "47");
		dummy9.setXMLParam("x", "334");
		dummy9.setXMLParam("y", "70");
		dummy10.setXMLParam("x", "331");
		dummy10.setXMLParam("y", "92");
		dummy11.setXMLParam("x", "202");
		dummy11.setXMLParam("background", "player.eq.buttonoverlayx");

		dummy12.setXMLParam("x", "6");
		dummy12.setXMLParam("image", "player.button.eqs2");
		dummy12.setXMLParam("downimage", "player.button.eqs2.down");
		dummy13.setXMLParam("x", "6");
		dummy13.setXMLParam("image", "player.button.viss2");
		dummy13.setXMLParam("downimage", "player.button.viss2.down");
		dummy14.setXMLParam("x", "0");
		dummy14.setXMLParam("image", "player.button.ctx");
		dummy14.setXMLParam("downimage", "player.button.ctx.down");

		dummy15.setXMLParam("x", "362");
		dummy15.setXMLParam("y", "131");

		dummy16.setXMLParam("x", "363");
		dummy16.setXMLParam("y", "151");

		dummy17.setXMLParam("x", "26");

		dummy18.setXMLParam("x", "0");
		dummy18.setXMLParam("image", "player.button.ct2x");
		dummy18.setXMLParam("downimage", "player.button.ct2x.down");

		dummy19.setXMLParam("x", "76");
		dummy20.setXMLParam("x", "61");

		dummy21.setXMLParam("x", "26");
		dummy22.setXMLParam("x", "26");
		dummy23.setXMLParam("x", "84");
		dummy24.setXMLParam("x", "26");

		dummyvisbbg1.setXMLParam("x", "135");
		dummyvisbbg2.setXMLParam("x", "175");
		dummyvisbbg3.setXMLParam("x", "135");
		dummyvisbbg4.setXMLParam("x", "175");
		dummyvisbbg5.setXMLParam("x", "135");
		dummyvisbbg6.setXMLParam("x", "175");
		dummyvisbfg1.setXMLParam("x", "56");
		dummyvisbfg2.setXMLParam("x", "56");
		dummyvisbfg3.setXMLParam("x", "56");

		dummyvled1.setXMLParam("x", "119");
		dummyvled2.setXMLParam("x", "207");
		dummyvled3.setXMLParam("x", "119");
		dummyvled4.setXMLParam("x", "207");
		dummyvled5.setXMLParam("x", "119");
		dummyvled6.setXMLParam("x", "207");
		dummyvled7.setXMLParam("x", "40");
		dummyvled8.setXMLParam("x", "40");
		dummyvled9.setXMLParam("x", "40");
		dummylabel4.setXMLParam("x", "120");
		dummylabel5.setXMLParam("x", "57");
		dummylabel9.setXMLParam("x", "18");

		dummyvisdtoggle2.setXMLParam("x", "6");
		dummyvisdtoggle2.setXMLParam("image", "player.button.viss");
		dummyvisdtoggle2.setXMLParam("downimage", "player.button.viss.down");

		dummyeqtoggle2b.setXMLParam("x", "6");
		dummyeqtoggle2b.setXMLParam("image", "player.button.eqs2");
		dummyeqtoggle2b.setXMLParam("downimage", "player.button.eqs2.down");

		dummycttoggle2b.setXMLParam("x", "0");
		dummycttoggle2b.setXMLParam("image", "player.button.ctx");
		dummycttoggle2b.setXMLParam("downimage", "player.button.ctx.down");

		EQCTVISDrawer_x_start=203;
		EQCTVISDrawer_x_end=0;

		VISDrawer.setXMLParam("background", "player.visd.bgx");

		EQDrawer.setXMLParam("background", "player.eq.bgx");

		dummylabel6.setXMLParam("x", "42");
		dummylabel6.setXMLParam("image", "player.textlabel6x");

		dummylabel7.setXMLParam("x", "38");
		dummycfdisplaybg.setXMLParam("x", "206");
		dummycfdisplaybgoverlay.setXMLParam("x", "206");
		dummyeqonoffLed.setXMLParam("x", "60");
		dummyeqautoLed.setXMLParam("x", "118");

		dummypreamp.setXMLParam("x", "206");
		dummyeq1.setXMLParam("x", "39");
		dummyeq2.setXMLParam("x", "53");
		dummyeq3.setXMLParam("x", "67");
		dummyeq4.setXMLParam("x", "81");
		dummyeq5.setXMLParam("x", "95");
		dummyeq6.setXMLParam("x", "109");
		dummyeq7.setXMLParam("x", "123");
		dummyeq8.setXMLParam("x", "137");
		dummyeq9.setXMLParam("x", "151");
		dummyeq10.setXMLParam("x", "165");
		dummybalance.setXMLParam("x", "78");
		dummysCrossfade.setXMLParam("x", "155");

		dummycftext.setXMLParam("x", "207");

		dummyeqtoggle2.setXMLParam("x", "6");
		dummyeqtoggle2.setXMLParam("image", "player.button.eqs");
		dummyeqtoggle2.setXMLParam("downimage", "player.button.eqs.down");

		dummyvisdtoggle2b.setXMLParam("x", "6");
		dummyvisdtoggle2b.setXMLParam("image", "player.button.viss2");
		dummyvisdtoggle2b.setXMLParam("downimage", "player.button.viss2.down");

		dummycttoggle2.setXMLParam("x", "0");
		dummycttoggle2.setXMLParam("image", "player.button.ctx");
		dummycttoggle2.setXMLParam("downimage", "player.button.ctx.down");

		dummyeqonoff.setXMLParam("x", "41");
		dummyeqauto.setXMLParam("x", "88");
		dummyeqpresets.setXMLParam("x", "146");

		if (isEQOpen == 1) {
			EQDrawer.setXMLParam("x", "0");
		} else {
			EQDrawer.setXMLParam("x", "202");
		}

		if (isVISOpen == 1) {
			VISDrawer.setXMLParam("x", "0");
		} else {
			VISDrawer.setXMLParam("x", "202");
		}

		if (isCTOpen == 1) {
			CTDrawer.setXMLParam("x", "0");
		} else {
			CTDrawer.setXMLParam("x", "202");
		}

		CTList.setXMLParam("x", "26");
		CTList.setXMLParam("background", "player.ct.listbgx");
		CTDrawer.setXMLParam("background", "player.ct.bgx");

		CTLayer.setXMLParam("x", "202");
		CTLayer.setXMLParam("background", "player.ct.overlayx");

		dummy25.setXMLParam("x", "0");

		EQPush3.setXMLParam("x", "6");
		EQPush3.setXMLParam("image", "player.button.eqs2");
		EQPush3.setXMLParam("downimage", "player.button.eqs2.down");
		VISPush3.setXMLParam("x", "6");
		VISPush3.setXMLParam("image", "player.button.viss2");
		VISPush3.setXMLParam("downimage", "player.button.viss2.down");

	}

}

