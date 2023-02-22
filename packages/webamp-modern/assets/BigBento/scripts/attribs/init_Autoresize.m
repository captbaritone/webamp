/*---------------------------------------------------
-----------------------------------------------------
Filename:	init_Autoresize.m
Version:	1.1

Type:		maki/attrib definitions
Date:		23. Jan. 2008 - 20:31 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
Depending Files:
		scripts/maximize.m
		scripts/videoresize.maki
-----------------------------------------------------
---------------------------------------------------*/

#ifndef included
#error This script can only be compiled as a #include
#endif

#include "gen_pageguids.m"


Function initAttribs_Autoresize();


#define CUSTOM_PAGE_RESIZE "{E704AB5A-108E-4309-B54B-43EBA5C0C3AA}"

Global ConfigAttribute sui_autorsize_attrib, link_w_attrib, titlebar_dblclk_max_attib, titlebar_dblclk_shade_attib, collapse_top_attrib, collapse_bottom_attrib;
Global ConfigAttribute video_inframe_attrib;

initAttribs_Autoresize()
{
	initPages();
	
	ConfigItem custom_page_autoresize = addConfigSubMenu(optionsmenu_page, "Window Sizing", CUSTOM_PAGE_RESIZE);

	sui_autorsize_attrib = custom_page_autoresize.newAttribute("Autoresize Main Window if maximized", "0");
	link_w_attrib = custom_page_autoresize.newAttribute("Link shade and player width", "1");
	addMenuSeparator(custom_page_autoresize);
	video_inframe_attrib = custom_page_autoresize.newAttribute("Enable Video in Window resizing", "0");
	addMenuSeparator(custom_page_autoresize);
	titlebar_dblclk_shade_attib = custom_page_autoresize.newAttribute("Switch to Shade on Titlebar Doubleclick", "1");
	titlebar_dblclk_max_attib = custom_page_autoresize.newAttribute("Maximize Window on Titlebar Doubleclick", "0");
	addMenuSeparator(custom_page_autoresize);
	collapse_top_attrib = custom_page_autoresize.newAttribute("Collapse Window to Top", "1");
	collapse_bottom_attrib = custom_page_autoresize.newAttribute("Collapse Window to Bottom", "0");
}

#ifdef MAIN_ATTRIBS_MGR

titlebar_dblclk_shade_attib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	if (getData() == "1") titlebar_dblclk_max_attib.setData("0");
	if (getData() == "0") titlebar_dblclk_max_attib.setData("1");
	attribs_mychange = 0;
}
titlebar_dblclk_max_attib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	if (getData() == "1") titlebar_dblclk_shade_attib.setData("0");
	if (getData() == "0") titlebar_dblclk_shade_attib.setData("1");
	attribs_mychange = 0;
}

collapse_bottom_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	if (getData() == "1") collapse_top_attrib.setData("0");
	if (getData() == "0") collapse_top_attrib.setData("1");
	attribs_mychange = 0;
}
collapse_top_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	if (getData() == "1") collapse_bottom_attrib.setData("0");
	if (getData() == "0") collapse_bottom_attrib.setData("1");
	attribs_mychange = 0;
}

#endif