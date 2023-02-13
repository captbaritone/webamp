/*---------------------------------------------------
-----------------------------------------------------
Filename:	mcvcore.m
Version:	4.5

Type:		maki
Date:		13. Aug. 2007 - 11:22 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu

Note:		This script is based on drawer.m
		from Winamp Modern, but extended to
		5 components presets!
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
#include attribs/init_windowpage.m
#include attribs/init_vis.m

#define DEBUG
#define FILE_NAME "infocompcore.m"
#include <lib/debug.m>

#define VIS_GUID "{0000000A-000C-0010-FF7B-01014263450C}"

#ifndef DOHIDEMCV
#define updateSaving //
#endif

//define FIT_W2_COMP fit(sui_fi, 159, 0, 2, 0, -162, 1, 76, 0)
#define FIT_W2_COMP fit(sui_fi, 234, 0, 2, 0, -236, 1, 117, 0)
//define FIT_W_COMP fit(sui_fi, 81, 0, 2, 0, -84, 1, 76, 0)
#define FIT_W_COMP fit(sui_fi, 119, 0, 2, 0, -121, 1, 117, 0)
#define FIT_WO_COMP fit(sui_fi, 4, 0, 2, 0, -6, 1, 117, 0)

Global Boolean bypasscancel;
Global Timer callbackTimer, tempDisable;

#define CURR_COMP plsc
#include mcvcore/defs.m

#ifdef IC_COVERFLOW
#undef CURR_COMP
#define CURR_COMP cflow
#include mcvcore/defs.m
#endif

Function fit (group g, int x, int rx, int y, int ry, int w, int rw, int h, int rh); 

Function switchToIcOnly();
Function switchToCover();
Function switchToVisCover();
Function switchToVis();
Function switchToEQ();
Function switchToCfg();
Function switchToVis_Full();
Function updateFileInfo();

Function hideFi();
Function showFi();
Function hideCover();
Function showCover();
Function hideVis();
Function showVis();
Function hideVis_Full();
Function showVis_Full();
Function hideEq();
Function showEq();
Function hideCfg();
Function showCfg();
Function openIC();
Function closeIC();
Function openLC();
Function closeLC();
#ifdef DOHIDEMCV
Function hideMCV();
#endif

Function onHideFi();
Function onShowFi();
Function onHideCover();
Function onShowCover();
Function onHideVis();
Function onShowVis();
Function onHideVis_Full();
Function onShowVis_Full();
Function onHideEq();
Function onShowEq();
Function onHideCfg();
Function onShowCfg();
Function onCloseIC();
Function onOpenIC();
Function onhideMCV();

Function dc_hideFi();
Function dc_showFi();
Function dc_showEq();
Function dc_hideEq();
Function dc_showCfg();
Function dc_hideCfg();
Function dc_hideCover();
Function dc_showCover();
Function dc_hideVis();
Function dc_showVis();
Function dc_hideVis_Full();
Function dc_showVis_Full();

Function updateFooter();

Function ProcessMenuResult (int a);

#ifdef DOHIDEMCV
function updateSaving (int l);
#endif

Global Group sg, sui_cover, sui_vis_full, sui_vis, sui_fi, sui_eq, sui_cfg, g_footer, g_visbtns;
Global Layout main;
Global Boolean callback_showing_vis, callback_hiding_vis, callback_showing_vis_full, callback_hiding_vis_full, callback_showing_cover, callback_hiding_cover, callback_showing_fi, callback_hiding_fi, callback_hiding_eq, callback_showing_eq, callback_hiding_cfg, callback_showing_cfg;
Global Boolean showing_vis, hiding_vis, showing_vis_full, hiding_vis_full, showing_cover, hiding_cover, hiding_fi, showing_fi, showing_eq, hiding_eq, showing_cfg, hiding_cfg;
Global Boolean Mychange;
Global Boolean prevent_vis = 1;
Global Frame dualwnd, mainframe;
Global GuiObject footerGrid, sendToBtn;

Global Popupmenu compMenu;
Global Button compChoose, nowPlayingBtn, webSearchBtn;
Global Boolean startup_done;
Global int substract = 0;

#ifdef DOHIDEMCV
Global Int last_menu_sel;
#endif

// script loading/unloading goes here
#include mcvcore/load_handles.m

// open / hiding components not caused by button clicks
#include mcvcore/external_handles.m

// showing and hiding the components
#include mcvcore/show_hide.m


/* Switching menu */
compChoose.onRightButtonUp(int x, int y)
{
	complete;
}

compChoose.onRightClick () {
	compChoose.onLeftClick ();
}

compChoose.onLeftClick ()
{
	compMenu = new Popupmenu;
	popupmenu fiSub = new Popupmenu;
	compMenu.addCommand("File Info", 1, ic_fileinfo.getData() == "1", 0);
#ifdef IC_COVERFLOW
	compMenu.addCommand("Cover Flow", 7, _cflow_ic_attrib.getData() == "1", 0);
#endif
	compMenu.addCommand("Visualization", 2, ic_vis.getData() == "1", 0);
	compMenu.addCommand("Stored Playlists", 3, _plsc_ic_attrib.getData() == "1", 0);
	compMenu.addCommand("Equalizer", 4, ic_eq.getData() == "1", 0);
	compMenu.addCommand("Skin Settings", 5, ic_config.getData() == "1", 0);
#ifdef DOHIDEMCV
	compMenu.addCommand("Hide Multi Content View", 6, ic_hidden.getData() == "1", 0);
#endif
	compMenu.addSeparator();
	compMenu.addSubmenu(fiSub, "File Info Components");

	fiSub.addCommand("Visualization", 12, ic_vis_fileinfo.getData() == "1", 0);
	fiSub.addCommand("Album Art", 11, ic_cover_fileinfo.getData() == "1", 0);
	fiSub.addSeparator();
	fiSub.addCommand("Show Track #", 24, infocomp_show_track.getData() == "1", 0);
	fiSub.addCommand("Show Year", 21, infocomp_show_year.getData() == "1", 0);
	fiSub.addCommand("Show Genre", 22, infocomp_show_genre.getData() == "1", 0);
	fiSub.addCommand("Show Disc", 28, infocomp_show_disc.getData() == "1", 0);
	fiSub.addCommand("Show Album Artist", 25, infocomp_show_albumartist.getData() == "1", 0);
	fiSub.addCommand("Show Composer", 26, infocomp_show_composer.getData() == "1", 0);
	fiSub.addCommand("Show Publisher", 23, infocomp_show_publisher.getData() == "1", 0);
	fiSub.addCommand("Show Decoder", 27, infocomp_show_format.getData() == "1", 0);
	fiSub.addCommand("Show Song Rating", 20, infocomp_show_rating.getData() == "1", 0);
	fiSub.addSeparator();
	fiSub.addCommand("Cycle File Info", 30, infocomp_cycle.getData() == "1", 0);
	fiSub.addSeparator();
	fiSub.addCommand("Open Links in Now Playing", 40, infocomp_nowplaying.getData() == "1", 0);
	fiSub.addCommand("Open Links in Browser", 41, infocomp_browser.getData() == "1", 0);

	ProcessMenuResult (compMenu.popAtXY(clientToScreenX(compChoose.getLeft()), clientToScreenY(compChoose.getTop() + compChoose.getHeight())));
	delete compMenu;
	delete fiSub;
	complete;
}

ProcessMenuResult (int a)
{
	if (a < 1) return;
	if (a == 1)
	{
		ic_fileinfo.setData("1");
	}
	else if (a == 2)
	{
		ic_vis.setData("1");
	}
	else if (a == 3)
	{
		_plsc_ic_attrib.setData("1");
	}
#ifdef IC_COVERFLOW
	else if (a == 7)
	{
		_cflow_ic_attrib.setData("1");
	}
#endif
	else if (a == 4)
	{
		ic_eq.setData("1");
	}
	else if (a == 5)
	{
		ic_config.setData("1");
	}
#ifdef DOHIDEMCV
	else if (a == 6)
	{
		ic_hidden.setData("1");
	}
#endif
	else if (a == 11)
	{
		toggleAttrib(ic_cover_fileinfo);
	}
	else if (a == 12)
	{
		toggleAttrib(ic_vis_fileinfo);
	}
	else if (a == 20)
	{
		toggleAttrib(infocomp_show_rating);
	}
	else if (a == 21)
	{
		toggleAttrib(infocomp_show_year);
	}
	else if (a == 22)
	{
		toggleAttrib(infocomp_show_genre);
	}
	else if (a == 23)
	{
		toggleAttrib(infocomp_show_publisher);
	}
	else if (a == 24)
	{
		toggleAttrib(infocomp_show_track);
	}
	else if (a == 25)
	{
		toggleAttrib(infocomp_show_albumartist);
	}
	else if (a == 26)
	{
		toggleAttrib(infocomp_show_composer);
	}
	else if (a == 27)
	{
		toggleAttrib(infocomp_show_format);
	}
	else if (a == 28)
	{
		toggleAttrib(infocomp_show_disc);
	}
	else if (a == 30)
	{
		toggleAttrib(infocomp_cycle);
	}
	else if (a == 40)
	{
		toggleAttrib(infocomp_nowplaying);
	}
	else if (a == 41)
	{
		toggleAttrib(infocomp_browser);
	}
}

// Hiding footer buttons (for file info view)

g_footer.onResize (int x, int y, int w, int h)
{
	if (substract == 1) 
		w += stringToInteger(dualwnd.getXmlParam("maxwidth")) + 78;
	else if (substract == 2)
		w += stringToInteger(dualwnd.getXmlParam("maxwidth")) + 102;

	if (w < 132) footerGrid.hide();
	else footerGrid.show();

	if (w < 125) nowPlayingBtn.hide();
	else nowPlayingBtn.show();

	if (w < 94) webSearchBtn.hide();
	else webSearchBtn.show();

	if (w < 63) sendToBtn.hide();
	else sendToBtn.show();

	if (w < 32) compChoose.hide();
	else compChoose.show();
}

updateFooter ()
{
	g_footer.onResize (0, 0, g_footer.getWidth(), 0);
}

#ifdef DOHIDEMCV
// Switching back from no comp

sg.onResize (int x, int y, int w, int h)
{

	if (ic_hidden.getData() == "0" || last_menu_sel == 0 || w == 0)// && dualwnd.getXmlParam("from") == "left")
	{
		return;
	}
	ProcessMenuResult (getPrivateInt(getSkinName(), "MCV last sel", 1));
}

// save last pos

updateSaving (int l)
{
	if (last_menu_sel == l)
	{
		return;
	}
	if (last_menu_sel != 0) setPrivateInt(getSkinName(), "MCV last sel", last_menu_sel);
	last_menu_sel = l;
}
#endif

/** OSD */
/*
Global boolean mouse_is_over = FALSE;

osd_trigger.onEnterArea ()
{
	//setXmlParam("ghost", "1");
}

osd_trigger.onMouseMove (int x, int y)
{
	if (!isMouseOverRect() && mouse_is_over)
	{
		mouse_is_over = 0;
		component c = sui_vis_full.findObject("vis");
		c.sendAction("setregion", "vis.normal.region", 0, 0, 0, 0);
		c = sui_vis.findObject("vis");
		c.sendAction("setregion", "vis.normal.region", 0, 0, 0, 0);
	}
	else if (isMouseOverRect() && !mouse_is_over)
	{
		mouse_is_over = 1;
		component c = sui_vis_full.findObject("vis");
		c.sendAction("setregion", "vis.button.region", 0, 0, 0, 0);
		c = sui_vis.findObject("vis");
		c.sendAction("setregion", "vis.button.region", 0, 0, 0, 0);
	}
}

osd_trigger.onLeaveArea ()
{
	component c = sui_vis_full.findObject("vis");
	c.sendAction("setregion", "vis.normal.region", 0, 0, 0, 0);	
}*/

/** Calls after comp is shown */

onCloseIC() {}
onOpenIC() {}

onShowCover() {}

onHideCover() {}

onShowFi() {}

onHideFi() {}

onShowEq() {}

onHideEq() {}

onShowCfg() {}

onHideCfg() {}

onShowVis()
{
	g_visbtns.show();
}
onHideVis()
{
	g_visbtns.hide();
}

onShowVis_Full() {}

onHideVis_Full() {}

#ifdef DOHIDEMCV
onhideMCV() {}
#endif

fit (group g, int x, int rx, int y, int ry, int w, int rw, int h, int rh)
{
	if (!g) return;
	g.setXmlParam("x", integerToString(x));
	g.setXmlParam("y", integerToString(y));
	g.setXmlParam("w", integerToString(w));
	g.setXmlParam("h", integerToString(h));
	g.setXmlParam("relatx", integerToString(rx));
	g.setXmlParam("relaty", integerToString(ry));
	g.setXmlParam("relatw", integerToString(rw));
	g.setXmlParam("relath", integerToString(rh));
}