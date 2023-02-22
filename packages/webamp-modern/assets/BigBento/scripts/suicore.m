/*---------------------------------------------------
-----------------------------------------------------
Filename:	suicore.m
Version:	4.3

Type:		maki
Date:		02. Sep. 2007 - 17:35 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu

Note:		This script is based on drawer.m
		from Winamp Modern, but extended to
		4 components that can be closed!
		Like in drawer.m I warn everybody not 
		to modify this script, cause it can be
		harmed very fast! And you don't want
		a buggy winamp skin, want you?

		Since script version 3.1
		(onesie build #022)
		the script is devided into subscripts
		for better debugging.
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>
#include <lib/config.mi>
#include <lib/winampconfig.mi>

#include attribs/init_windowpage.m
#include attribs/init_Autoresize.m
#include attribs/init_vis.m

// #define DEBUG
#define FILE_NAME "suicore.m"
#include <lib/debug.m>

#define ML_GUID "{6B0EDF80-C9A5-11D3-9F26-00C04F39FFC6}"
#define VIS_GUID "{0000000A-000C-0010-FF7B-01014263450C}"
#define VIDEO_GUID "{F0816D7B-FFFC-4343-80F2-E8199AA15CC3}"
#define PL_GUID "{45F3F7C1-A6F3-4EE6-A15E-125E92FC3F8D}"

Function switchToMl();
Function switchToVideo();
Function switchToVis();
Function switchToBrw();
//--Function switchToExp();
//--Function switchToCfg();
Function switchToNoComp();
Function switchFromNoComp();

Function hideMl();
Function showMl();
Function hideVis();
Function showVis();
Function showVideo();
Function hideVideo();
//--Function hideExp();
//--Function showExp();
Function hideBrw();
Function showBrw();
//--Function hideCfg();
//--Function showCfg();

Function onShowMl();
Function onHideMl();
Function onShowVis();
Function onHideVis();
Function onShowVideo();
Function onHideVideo();
//--Function onShowExp();
//--Function onHideExp();
Function onShowBrw();
Function onHideBrw();
//--Function onShowCfg();
//--Function onHideCfg();
Function onShowSUI();
Function onHideSUI();
Function onBeforeHideSUI();

Function dc_showMl();
Function dc_hideMl();
Function dc_showVis();
Function dc_showVideo();
Function dc_hideVis();
Function dc_hideVideo();
//--Function dc_showExp();
//--Function dc_hideExp();
Function dc_showBrw();
Function dc_hideBrw();
//--Function dc_showCfg();
//--Function dc_hideCfg();

Function dc_showSUI();
Function dc_closeSUI();

Global GuiObject sui_window;
Global Group sui_components;
Global Group sui_vis, sui_video, sui_ml, sui_brw/*--, sui_exp, sui_cfg--*/;
Global Button switch_ml, switch_video, switch_vis, /*--switch_exp,--*/ switch_brw /*--switch_cfg--*/;
Global Button hide_sui, show_sui;
Global Boolean bypasscancel;
Global Boolean showing_vis, hiding_vis, showing_video, hiding_video, showing_ml, hiding_ml;
Global Boolean /*--showing_exp, hiding_exp,--*/ showing_brw, hiding_brw/*--, showing_cfg, hiding_cfg--*/;

Global Boolean callback_showing_vis, callback_hiding_vis, callback_showing_video, callback_hiding_video, callback_showing_ml, callback_hiding_ml;
Global Boolean /*--callback_showing_exp, callback_hiding_exp,--*/ callback_showing_brw, callback_hiding_brw/*--, callback_showing_cfg, callback_hiding_cfg--*/;
Global Boolean callback_closing_sui, callback_showing_sui;
Global Layout normal;
Global Container player;
Global Boolean Mychange;
Global Boolean startup;
Global layer normal_resizer, normal_resizer2, normal_resizer3, normal_resizer4, normal_TBresizer, normal_TBresizer2, normal_TBresizer3;

Global string h;

Global Timer callbackTimer, tempDisable;

//Global Button b_maximize, b_minimize, b_shade;

// init special handles for video
#include suicore/video_handles.m

// script loading/unloading goes here
#include suicore/load_handles.m

// open / hiding components not caused by button clicks
#include suicore/external_handles.m

// showing and hiding the components
#include suicore/show_hide.m


/** Button Clicks */

switch_video.onLeftClick ()
{
	debugString("switch_video.Clicked()", D_WTF);
	switchToVideo();
}

switch_vis.onLeftClick ()
{
	debugString("switch_vis.Clicked()", D_WTF);
	vis_inbig_attrib.setData("1");
	switchToVis();
}

switch_ml.onLeftClick ()
{
	debugString("switch_ml.Clicked()", D_WTF);
	switchToMl();
}

switch_brw.onLeftClick ()
{
	debugString("switch_brw.Clicked()", D_WTF);
	switchToBrw();
}
/*--
switch_exp.onLeftClick ()
{
	debugString("switch_exp.Clicked()", D_WTF);
	switchToExp();
}
--*/
/*--switch_cfg.onLeftClick ()
{
	debugString("switch_cfg.Clicked()", D_WTF);
	switchToCfg();
}--*/

show_sui.onLeftClick ()
{
	debugString("show_sui.Clicked()", D_WTF);
	switchFromNoComp();
}

hide_sui.onLeftClick ()
{
	debugString("hide_sui.Clicked()", D_WTF);
	switchToNoComp();

}

/** Calls after comp is shown */

onShowMl()
{
	switch_ml.setActivated(1);
	switch_vis.setActivated(0);
	switch_video.setActivated(0);
	switch_brw.setActivated(0);
	//--switch_exp.setActivated(0);
	switch_ml.setXmlParam("ghost", "1");
	switch_video.setXmlParam("ghost", "0");
	switch_vis.setXmlParam("ghost", "0");
	switch_brw.setXmlParam("ghost", "0");
	//--switch_Cfg.setActivated(0);
}
onHideMl() {
	//switch_ml.setXmlParam("ghost", "0");
}

onShowVis()
{
	switch_ml.setActivated(0);
	switch_vis.setActivated(1);
	switch_video.setActivated(0);
	switch_brw.setActivated(0);
	//--switch_exp.setActivated(0);
	switch_vis.setXmlParam("ghost", "1");
	switch_video.setXmlParam("ghost", "0");
	switch_ml.setXmlParam("ghost", "0");
	switch_brw.setXmlParam("ghost", "0");
	//hideNamedWindow(ML_GUID);
	//--switch_Cfg.setActivated(0);
}

onHideVis() {
	//switch_vis.setXmlParam("ghost", "0");
}

onShowVideo()
{
	switch_ml.setActivated(0);
	switch_vis.setActivated(0);
	switch_video.setActivated(1);
	switch_brw.setActivated(0);
	//--switch_exp.setActivated(0);
	switch_video.setXmlParam("ghost", "1");
	switch_vis.setXmlParam("ghost", "0");
	switch_ml.setXmlParam("ghost", "0");
	switch_brw.setXmlParam("ghost", "0");
	//hideNamedWindow(ML_GUID);
	//--switch_Cfg.setActivated(0);
}
onHideVideo() {
	//switch_video.setXmlParam("ghost", "0");
}

onShowBrw()
{
	switch_ml.setActivated(0);
	switch_vis.setActivated(0);
	switch_video.setActivated(0);
	switch_brw.setActivated(1);
	//--switch_exp.setActivated(0);
	switch_brw.setXmlParam("ghost", "1");
	switch_vis.setXmlParam("ghost", "0");
	switch_ml.setXmlParam("ghost", "0");
	switch_video.setXmlParam("ghost", "0");
	//hideNamedWindow(ML_GUID);
	//--switch_Cfg.setActivated(0);
}
onHideBrw() {
	//switch_brw.setXmlParam("ghost", "0");
}
/*-
onShowExp()
{
	switch_ml.setActivated(0);
	switch_vis.setActivated(0);
	switch_video.setActivated(0);
	switch_brw.setActivated(0);
	//--switch_exp.setActivated(1);
	//--switch_exp.setXmlParam("ghost", "1");

	//hideNamedWindow(ML_GUID);
	//--switch_Cfg.setActivated(0);
}
onHideExp() {
	switch_exp.setXmlParam("ghost", "0");
}
--*/
/*--onShowCfg()
{
	switch_ml.setActivated(0);
	switch_vis.setActivated(0);
	switch_video.setActivated(0);
	switch_brw.setActivated(0);
	switch_exp.setActivated(0);
	//--switch_Cfg.setActivated(1);
}
onHideCfg() {}--*/

onShowSUI ()
{
	/*string x = b_shade.getXmlParam("x");
	b_shade.setXmlParam("x", b_minimize.getXmlParam("x"));
	b_minimize.setXmlParam("x", b_maximize.getXmlParam("x"));
	b_maximize.setXmlParam("x", x);
	b_maximize.show();*/
	sui_window.sendAction("callback", "onshowsui", 0,0,0,0);
	
}

onHideSUI ()
{
	//hideNamedWindow(ML_GUID);
	/*string x = b_minimize.getXmlParam("x");
	debugInt(b_shade.getGuiX());
	b_minimize.setXmlParam("x", b_shade.getXmlParam("x"));
	b_shade.setXmlParam("x", b_maximize.getXmlParam("x"));
	b_maximize.setXmlParam("x", x);
	b_maximize.hide();*/
//	sui_window.sendAction("callback", "onhidesui", 0,0,0,0);
}

onBeforeHideSUI ()
{
	//hideNamedWindow(ML_GUID);
	/*string x = b_minimize.getXmlParam("x");
	debugInt(b_shade.getGuiX());
	b_minimize.setXmlParam("x", b_shade.getXmlParam("x"));
	b_shade.setXmlParam("x", b_maximize.getXmlParam("x"));
	b_maximize.setXmlParam("x", x);
	b_maximize.hide();*/
	sui_window.sendAction("callback", "onbeforehidesui", 0,0,0,0);
}


#ifdef DEBUG

/** Debug Stuff */

sui_ml.onSetVisible (Boolean onoff)
{
	debugString(DEBUG_PREFIX "sui_ml.setVisible(" +integerToString(onoff)+ ");", D_WTF);
}
sui_vis.onSetVisible (Boolean onoff)
{
	debugString(DEBUG_PREFIX "sui_vis.setVisible(" +integerToString(onoff)+ ");", D_WTF);
}
sui_video.onSetVisible (Boolean onoff)
{
	debugString(DEBUG_PREFIX "sui_video.setVisible(" +integerToString(onoff)+ ");", D_WTF);
}
sui_brw.onSetVisible (Boolean onoff)
{
	debugString(DEBUG_PREFIX "sui_brw.setVisible(" +integerToString(onoff)+ ");", D_WTF);
}/*-
sui_exp.onSetVisible (Boolean onoff)
{
	debugString(DEBUG_PREFIX "sui_exp.setVisible(" +integerToString(onoff)+ ");", D_WTF);
}-*/
/*--sui_cfg.onSetVisible (Boolean onoff)
{
	debugString(DEBUG_PREFIX "sui_cfg.setVisible(" +integerToString(onoff)+ ");", D_WTF);
}--*/

#endif
