/*---------------------------------------------------
-----------------------------------------------------
Filename:	buttonpos.m
Version:	1.0

Type:		maki
Date:		03. Jun. 2008 - 21:29
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
Depending Files:
		browser.maki
-----------------------------------------------------
---------------------------------------------------*/

#ifndef included
#error This script can only be compiled as a #include
#endif

#define MARGIN_RIGHT 2
#define HIDE_RESCAN_SPACER 16
#define BUTTON_SPACER 8
#define BIG_BUTTON_SPACER 10

Function int max (int a, int b);
Function setGuiX (GuiObject g, int x);

Global GuiObject scr_open_xui, scr_close_xui, scr_rescan_xui, scr_download_xui, scr_play_xui, dld_play_xui;
Global GuiObject switch_scr_xui, switch_scr2_xui, switch_dld_xui, switch_dld2_xui, settings_xui;
Global Int x_open_close, x_rescan, x_download, x_play, x_dld_play;
Global Int w_switch_scr, w_switch_dld, w_settings;
Global Int margin_left;

Global boolean done;

Function initButtonPos();
Function hideDownloads();
initButtonPos()
{
	scr_open_xui = scr_open.getParent();
	scr_close_xui = scr_close.getParent();
	scr_rescan_xui = scr_rescan.getParent();
	scr_download_xui = scr_download.getParent();
	scr_play_xui = scr_play.getParent();
	dld_play_xui = dld_play.getParent();

	switch_scr_xui = switch_scr.getParent();
	switch_scr2_xui = switch_scr2.getParent();
	switch_dld_xui = switch_dld.getParent();
	switch_dld2_xui = switch_dld2.getParent();

	settings_xui = dld_settings.getParent();
}

/// HACK
normal.onsetvisible(boolean a)
{
	if (done)
	{
		return;
	}
	if (!download)
	{ 
		hideDownloads();
		done = 1;
		return;
	}
	
	done = 1;
	
	int i1 = scr_open_xui.onAction ("getwidth", "", 0,0,0,0,scr_open_xui);
	int i2 = scr_close_xui.onAction ("getwidth", "", 0,0,0,0,scr_close_xui);
	x_open_close = max(i1, i2) + MARGIN_RIGHT;
	setGuiX(scr_open_xui, -x_open_close);
	setGuiX(scr_close_xui, -x_open_close);

	i1 = dld_play_xui.onAction ("getwidth", "", 0,0,0,0,dld_play_xui);
	x_dld_play = i1 + x_open_close + HIDE_RESCAN_SPACER;
	setGuiX(dld_play_xui, -x_dld_play);

	i1 = scr_rescan_xui.onAction ("getwidth", "", 0,0,0,0,scr_rescan_xui);
	x_rescan = i1 + x_open_close + HIDE_RESCAN_SPACER;
	setGuiX(scr_rescan_xui, -x_rescan);

	i1 = scr_download_xui.onAction ("getwidth", "", 0,0,0,0,scr_download_xui);
	x_download = i1 + x_rescan + BUTTON_SPACER;
	setGuiX(scr_download_xui, -x_download);

	i1 = scr_play_xui.onAction ("getwidth", "", 0,0,0,0,scr_play_xui);
	x_play = i1 + x_download + BUTTON_SPACER;
	setGuiX(scr_play_xui, -x_play);


	margin_left = switch_scr_xui.getGuiX();
	w_switch_scr = switch_scr_xui.onAction ("getwidth", "", 0,0,0,0,switch_scr_xui) + margin_left + BIG_BUTTON_SPACER;
	switch_scr2_xui.onAction ("getwidth", "", 0,0,0,0,switch_scr2_xui);

	w_switch_dld = switch_dld_xui.onAction ("getwidth", "", 0,0,0,0,switch_dld_xui) + w_switch_scr + BIG_BUTTON_SPACER;
	switch_dld2_xui.onAction ("getwidth", "", 0,0,0,0,switch_dld2_xui);
	setGuiX(switch_dld_xui, w_switch_scr);
	setGuiX(switch_dld2_xui, w_switch_scr);

	w_settings = settings_xui.onAction ("getwidth", "", 0,0,0,0,settings_xui) + w_switch_dld + BIG_BUTTON_SPACER;
	setGuiX(settings_xui, w_switch_dld);
}

hideDownloads ()
{
	if (download)
	{
		return;
	}
	
	int i1 = scr_open_xui.onAction ("getwidth", "", 0,0,0,0,scr_open_xui);
	int i2 = scr_close_xui.onAction ("getwidth", "", 0,0,0,0,scr_close_xui);
	x_open_close = max(i1, i2) + MARGIN_RIGHT;
	setGuiX(scr_open_xui, -x_open_close);
	setGuiX(scr_close_xui, -x_open_close);

	i1 = scr_rescan_xui.onAction ("getwidth", "", 0,0,0,0,scr_rescan_xui);
	x_rescan = i1 + x_open_close + HIDE_RESCAN_SPACER;
	setGuiX(scr_rescan_xui, -x_rescan);

	i1 = scr_play_xui.onAction ("getwidth", "", 0,0,0,0,scr_play_xui);
	x_play = i1 + x_rescan + BUTTON_SPACER;
	setGuiX(scr_play_xui, -x_play);

	margin_left = switch_scr_xui.getGuiX();
	w_switch_scr = switch_scr_xui.onAction ("getwidth", "", 0,0,0,0,switch_scr_xui) + margin_left + BIG_BUTTON_SPACER;
	switch_scr2_xui.onAction ("getwidth", "", 0,0,0,0,switch_scr2_xui);

	settings_xui.hide();
	switch_dld2_xui.hide();
	switch_dld_xui.hide();
	dld_play.hide();
	scr_download_xui.hide();
}

scr_mode.onResize (int x, int y, int w, int h)
{
	boolean isOpen = browser_scr_show_attrib.getData() == "1";

	if (w > w_settings + x_play && isOpen)
	{
		scr_play_xui.show();
		if (download) scr_download_xui.show();
		scr_rescan_xui.show();	
		if (download) settings_xui.show();
		scr_open_xui.setAlpha(255);
		scr_close_xui.setAlpha(255);
	}
	else if (w > w_settings + x_download && isOpen)
	{
		scr_play_xui.hide();
		if (download) scr_download_xui.show();
		scr_rescan.show();
		if (download) settings_xui.show();
		scr_open_xui.setAlpha(255);
		scr_close_xui.setAlpha(255);
	}
	else if (w > w_settings + x_rescan && isOpen)
	{
		scr_play_xui.hide();
		if (download) scr_download_xui.hide();
		scr_rescan_xui.show();
		if (download) settings_xui.show();
		scr_open_xui.setAlpha(255);
		scr_close_xui.setAlpha(255);
	}
	else if (w > w_settings + x_open_close)
	{
		scr_play_xui.hide();
		if (download) scr_download_xui.hide();
		scr_rescan_xui.hide();
		if (download) settings_xui.show();
		scr_open_xui.setAlpha(255);
		scr_close_xui.setAlpha(255);
	}
	else if (w > w_switch_dld + x_open_close)
	{
		scr_play_xui.hide();
		if (download) scr_download_xui.hide();
		scr_rescan_xui.hide();
		if (download) settings_xui.hide();
		scr_open_xui.setAlpha(255);
		scr_close_xui.setAlpha(255);
	}
	else
	{
		scr_play_xui.hide();
		if (download) scr_download_xui.hide();
		scr_rescan_xui.hide();
		if (download) settings_xui.hide();
		scr_open_xui.setAlpha(0);
		scr_close_xui.setAlpha(0);		
	}
}

dld_mode.onResize (int x, int y, int w, int h)
{
	if (!download)
	{
		return;
	}
	if (browser_scr_show_attrib.getData() == "0")
		return;	


	if (w > w_settings + x_dld_play)
	{
		dld_play_xui.show();		
	}
	else
	{
		dld_play_xui.hide();
	}	
}

int max (int a, int b)
{
	if (a > b)
	{
		return a;
	}
	else
	{
		return b;
	}
}
	
setGuiX (GuiObject g, int x)
{
	g.setXmlParam("x", integerToString(x));
}
