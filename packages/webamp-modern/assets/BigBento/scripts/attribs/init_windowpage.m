/*---------------------------------------------------
-----------------------------------------------------
Filename:	init_windowpage.m
Version:	1.1

Type:		maki/attrib definitions
Date:		08. Jul. 2006 - 17:28 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
Depending Files:
		scripts/mcvcompcore.maki
		scripts/suicore.maki
		scripts/browser.maki
		scripts/fileinfo.maki
-----------------------------------------------------
---------------------------------------------------*/

#ifndef included
#error This script can only be compiled as a #include
#endif

#include "gen_pageguids.m"

// define DOHIDEMCV
// define IC_COVERFLOW


#define CUSTOM_PAGE_FILEINFO "{6A619628-6A91-46e3-A3F3-5C1B2D93DF4F}"

Function initAttribs_windowpage();

Global ConfigAttribute sui_browser_attrib, sui_eq_attrib, sui_config_attrib;
Global ConfigAttribute ic_fileinfo, ic_cover_fileinfo, ic_vis, ic_vis_fileinfo, ic_hidden, ic_eq, ic_config, _plsc_ic_attrib;
#ifdef IC_COVERFLOW
Global ConfigAttribute _cflow_ic_attrib;
#else
#define _cflow_ic_attrib //
#endif

#ifdef DOHIDEMCV
Global ConfigAttribute ic_hidden;
#endif
Global ConfigItem custom_page_fileinfo;

#ifndef DOHIDEMCV
#define ic_hidden //
#endif

#define CUSTOM_PAGE_INFOCOMP "{8D3829F9-5790-4c8e-9C3A-C397D3602FF9}"
Class ConfigAttribute InfoLineAttribute;
Global InfoLineAttribute infocomp_show_rating, infocomp_show_genre, infocomp_show_year, infocomp_show_track, infocomp_show_publisher, infocomp_show_composer, infocomp_show_albumartist, infocomp_show_format, infocomp_show_disc;
Global ConfigAttribute infocomp_cycle, infocomp_nowplaying, infocomp_browser;

initAttribs_windowpage()
{
	initPages();

	sui_eq_attrib = custom_windows_page.newAttribute("Equalizer\tAlt+G", "0");
	sui_browser_attrib = custom_windows_page.newAttribute("Web Browser\tAlt+X", "0");
	sui_config_attrib = custom_windows_page.newAttribute("Skin Settings\tAlt+C", "0");

	custom_page_fileinfo = addConfigSubMenu(optionsmenu_page, "Multi Content View", CUSTOM_PAGE_FILEINFO);

	ic_fileinfo = custom_page_fileinfo.newAttribute("File Info", "1");
	_cflow_ic_attrib = custom_page_fileinfo.newAttribute("Cover Flow", "0");
	ic_vis = custom_page_fileinfo.newAttribute("Visualization  ", "0");
	_plsc_ic_attrib = custom_page_fileinfo.newAttribute("Stored Playlists", "0");
	ic_eq = custom_page_fileinfo.newAttribute("Equalizer", sui_eq_attrib.getData());
	ic_config = custom_page_fileinfo.newAttribute("Skin Settings", sui_config_attrib.getData());
#ifdef DOHIDEMCV
	ic_hidden = custom_page_fileinfo.newAttribute("Hide Multi Content View", "0");
#endif
	addMenuSeparator(custom_page_fileinfo);
	ConfigItem fileinfo_parent = addConfigSubMenu(custom_page_fileinfo, "File Info Components", CUSTOM_PAGE_INFOCOMP);

	ic_vis_fileinfo = fileinfo_parent.newAttribute("Visualization ", "0");
	ic_cover_fileinfo = fileinfo_parent.newAttribute("Album Art", "1");
	addMenuSeparator(fileinfo_parent);
	infocomp_show_track = fileinfo_parent.newAttribute("Show Track #", "1");
	infocomp_show_year = fileinfo_parent.newAttribute("Show Year", "1");
	infocomp_show_genre = fileinfo_parent.newAttribute("Show Genre", "1");
	infocomp_show_disc = fileinfo_parent.newAttribute("Show Disc", "1");
	infocomp_show_albumartist = fileinfo_parent.newAttribute("Show Album Artist", "1");
	infocomp_show_composer = fileinfo_parent.newAttribute("Show Composer", "1");
	infocomp_show_publisher = fileinfo_parent.newAttribute("Show Publisher", "1");
	infocomp_show_format = fileinfo_parent.newAttribute("Show Decoder", "1");
	infocomp_show_rating = fileinfo_parent.newAttribute("Show Song Rating", "1");
	addMenuSeparator(fileinfo_parent);
	infocomp_cycle = fileinfo_parent.newAttribute("Cycle File Info", "1");
	addMenuSeparator(fileinfo_parent);
	infocomp_nowplaying = fileinfo_parent.newAttribute("Open Links in Now Playing", "1");
	infocomp_browser = fileinfo_parent.newAttribute("Open Links in Browser", "0");
}

#ifdef MAIN_ATTRIBS_MGR
System.onKeyDown(String key) {
	if (key == "alt+x")
	{
		if (sui_browser_attrib.getData() == "0") sui_browser_attrib.setData("1");
		else sui_browser_attrib.setData("0");
		complete;
	}
	/*if (key == "alt+n")
	{
		if (sui_browser_attrib.getData() == "0") sui_browser_attrib.setData("1");
		else sui_browser_attrib.setData("0");
		complete;
	}*/
	/*if (key == "alt+c")
	{
		if (sui_cover_attrib.getData() == "0") sui_cover_attrib.setData("1");
		else sui_cover_attrib.setData("0");
		complete;
	}*/
	if (key == "alt+c")
	{
		if (sui_config_attrib.getData() == "0") sui_config_attrib.setData("1");
		else sui_config_attrib.setData("0");
		complete;
	}
	if (key == "alt+g")
	{
		if (sui_eq_attrib.getData() == "0") sui_eq_attrib.setData("1");
		else sui_eq_attrib.setData("0");
		complete;
	}
	/*if (key == "ctrl+f") {
		navigateUrl(getPath(getPlayItemString()));
		complete;
	}*/
}

ic_fileinfo.onDataChanged()
{
	//debugString("ic_fileinfo.setData(" + getData() + ")", 9);
	if (attribs_mychange2) return;
	NOOFF
	attribs_mychange2 = 1;
	ic_vis.setData("0");
	ic_eq.setData("0");
	ic_config.setData("0");
	_plsc_ic_attrib.setData("0");
	_cflow_ic_attrib.setData("0");
	ic_hidden.setdata("0");
	attribs_mychange2 = 0;
}

ic_vis.onDataChanged()
{
	//debugString("ic_vis.setData(" + getData() + ")", 9);
	if (attribs_mychange2) return;
	NOOFF
	attribs_mychange2 = 1;
	ic_fileinfo.setData("0");
	ic_eq.setData("0");
	ic_config.setData("0");
	_plsc_ic_attrib.setData("0");
	_cflow_ic_attrib.setData("0");
	ic_hidden.setdata("0");
	attribs_mychange2 = 0;
}

ic_eq.onDataChanged()
{
	if (!attribs_mychange)
	{
		attribs_mychange = 1;
		sui_eq_attrib.setData(getData());
		if (getData() == "1") sui_config_attrib.setData("0");
		attribs_mychange = 0;
	}
	//debugString("ic_vis_fileinfo.setData(" + getData() + ")", 9);
	if (attribs_mychange2) return;
	NOOFF
	attribs_mychange2 = 1;
	ic_fileinfo.setData("0");
	ic_vis.setData("0");
	ic_config.setData("0");
	_plsc_ic_attrib.setData("0");
	_cflow_ic_attrib.setData("0");
	ic_hidden.setdata("0");
	attribs_mychange2 = 0;
}

ic_config.onDataChanged()
{
	if (!attribs_mychange)
	{
		attribs_mychange = 1;
		sui_config_attrib.setData(getData());
		if (getData() == "1") sui_eq_attrib.setData("0");
		attribs_mychange = 0;
	}
	//debugString("ic_vis_fileinfo.setData(" + getData() + ")", 9);
	if (attribs_mychange2) return;
	NOOFF
	attribs_mychange2 = 1;
	ic_fileinfo.setData("0");
	ic_vis.setData("0");
	ic_eq.setData("0");
	_plsc_ic_attrib.setData("0");
	_cflow_ic_attrib.setData("0");
	ic_hidden.setdata("0");
	attribs_mychange2 = 0;
}

_plsc_ic_attrib.onDataChanged()
{
	//debugString("ic_fileinfo.setData(" + getData() + ")", 9);
	if (attribs_mychange2) return;
	NOOFF
	attribs_mychange2 = 1;
	ic_vis.setData("0");
	ic_eq.setData("0");
	ic_config.setData("0");
	ic_fileinfo.setData("0");
	_cflow_ic_attrib.setData("0");
	ic_hidden.setdata("0");
	attribs_mychange2 = 0;
}

#ifdef IC_COVERFLOW

_cflow_ic_attrib.onDataChanged()
{
	//debugString("ic_fileinfo.setData(" + getData() + ")", 9);
	if (attribs_mychange2) return;
	NOOFF
	attribs_mychange2 = 1;
	ic_vis.setData("0");
	ic_eq.setData("0");
	ic_config.setData("0");
	ic_fileinfo.setData("0");
	_plsc_ic_attrib.setData("0");
	ic_hidden.setdata("0");
	attribs_mychange2 = 0;
}

#endif

#ifdef DOHIDEMCV
ic_hidden.onDataChanged()
{
	//debugString("ic_fileinfo.setData(" + getData() + ")", 9);
	if (attribs_mychange2) return;
	NOOFF
	attribs_mychange2 = 1;
	ic_vis.setData("0");
	ic_eq.setData("0");
	ic_config.setData("0");
	ic_fileinfo.setData("0");
	_plsc_ic_attrib.setdata("0");
	_cflow_ic_attrib.setData("0");
	attribs_mychange2 = 0;
}
#endif

sui_eq_attrib.onDataChanged()
{
	//debugString("ic_vis_fileinfo.setData(" + getData() + ")", 9);
	if (attribs_mychange) return;
	attribs_mychange = 1;
	if (getData() == "1")
	{
		ic_eq.setData("1");
		sui_config_attrib.setData("0");
	}
	else ic_fileinfo.setData("1");
	attribs_mychange = 0;
}

sui_config_attrib.onDataChanged()
{
	//debugString("ic_vis_fileinfo.setData(" + getData() + ")", 9);
	if (attribs_mychange) return;
	attribs_mychange = 1;
	if (getData() == "1")
	{
		ic_config.setData("1");
		sui_eq_attrib.setData("0");
	}
	else ic_fileinfo.setData("1");
	attribs_mychange = 0;
}


infocomp_nowplaying.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	infocomp_browser.setData("0");
	attribs_mychange = 0;
}


infocomp_browser.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	infocomp_nowplaying.setData("0");
	attribs_mychange = 0;
}
#endif