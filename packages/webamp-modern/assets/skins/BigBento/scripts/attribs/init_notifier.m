/*---------------------------------------------------
-----------------------------------------------------
Filename:	init_notifier.m

Type:		maki/attrib definitions
Version:	1.1
Date:		12. Jul. 2006 - 16:15 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
Depending Files:
		wasabi/notifier/notifier.maki
-----------------------------------------------------
---------------------------------------------------*/

#ifndef included
#error This script can only be compiled as a #include
#endif

#include "gen_pageguids.m"


Function initAttribs_notifier();


#define CUSTOM_PAGE_NOTIFIER "{1AB968B3-8687-4a35-BA70-FCF6D92FB57F}"

#define CUSTOM_PAGE_NOTIFIER_AA "{7BF45B05-2B98-4de8-8778-E5CCC9639ED1}"

#define CUSTOM_PAGE_NOTIFIER_LOC "{715B2C0D-1DF0-4bb2-9D74-0FACAE27CE97}"

#define CUSTOM_PAGE_NOTIFIER_FDIN "{D9891A39-7A38-45d8-9D51-A08F7270C836}"

#define CUSTOM_PAGE_NOTIFIER_FDOUT "{560EAE41-1379-4927-AC55-FB5F4D47C9B8}"


Global ConfigAttribute notifier_minimized_attrib;
Global ConfigAttribute notifier_always_attrib;
Global ConfigAttribute notifier_never_attrib;
Global ConfigAttribute notifier_fadeintime_attrib;
Global ConfigAttribute notifier_fadeouttime_attrib;
Global ConfigAttribute notifier_holdtime_attrib;
Global ConfigAttribute notifier_hideinfullscreen_attrib;
Global ConfigAttribute notifier_windowshade_attrib;

Global ConfigAttribute notifier_opennowplaying_attrib;

Global ConfigAttribute notifier_fdout_alpha;
Global ConfigAttribute notifier_fdout_hslide;
Global ConfigAttribute notifier_fdout_vslide;

Global ConfigAttribute notifier_fdin_alpha;
Global ConfigAttribute notifier_fdin_hslide;
Global ConfigAttribute notifier_fdin_vslide;

Global ConfigAttribute notifier_loc_br_attrib;
Global ConfigAttribute notifier_loc_bl_attrib;
Global ConfigAttribute notifier_loc_tr_attrib;
Global ConfigAttribute notifier_loc_tl_attrib;
Global ConfigAttribute notifier_loc_bc_attrib;
Global ConfigAttribute notifier_loc_tc_attrib;

Global ConfigAttribute notifier_loc_vport_attrib;
Global ConfigAttribute notifier_loc_monitor_attrib;


initAttribs_notifier()
{

	initPages();
	
	ConfigItem custom_page_notifier = addConfigSubMenu(optionsmenu_page, "Notifications", CUSTOM_PAGE_NOTIFIER);
	
	notifier_always_attrib = custom_page_notifier.newAttribute("Show always", "1");
	notifier_windowshade_attrib = custom_page_notifier.newAttribute("Show with windowshade and when minimized", "0");
	notifier_minimized_attrib = custom_page_notifier.newAttribute("Show only when minimized", "0");
	notifier_minimized_attrib = custom_page_notifier.newAttribute("Show only when minimized", "0");
	notifier_never_attrib = custom_page_notifier.newAttribute("Never show", "0");
	addMenuSeparator(custom_page_notifier);
	
	ConfigItem custom_page_notifier_loc = addConfigSubMenu(custom_page_notifier, "Location", CUSTOM_PAGE_NOTIFIER_LOC);

	ConfigItem custom_page_notifier_fdin = addConfigSubMenu(custom_page_notifier, "Fade In Effect", CUSTOM_PAGE_NOTIFIER_FDIN);

	ConfigItem custom_page_notifier_fdout = addConfigSubMenu(custom_page_notifier, "Fade Out Effect", CUSTOM_PAGE_NOTIFIER_FDOUT);

	addMenuSeparator(custom_page_notifier);
	notifier_hideinfullscreen_attrib = custom_page_notifier.newAttribute("Disable in fullscreen", "1");
	addMenuSeparator(custom_page_notifier);
	notifier_opennowplaying_attrib = custom_page_notifier.newAttribute("Open Now Playing on Click", "1");

	notifier_fadeintime_attrib = custom_page_nonexposed.newAttribute("Notifications fade in time", "1000");
	notifier_fadeouttime_attrib = custom_page_nonexposed.newAttribute("Notifications fade out time", "5000");
	notifier_holdtime_attrib = custom_page_nonexposed.newAttribute("Notifications display time", "2000");


// Notifications > Location
	notifier_loc_bl_attrib = custom_page_notifier_loc.newAttribute("Bottom Left", "0");
	notifier_loc_bc_attrib = custom_page_notifier_loc.newAttribute("Bottom Center", "0");
	notifier_loc_br_attrib = custom_page_notifier_loc.newAttribute("Bottom Right", "1");
	notifier_loc_tl_attrib = custom_page_notifier_loc.newAttribute("Top Left", "0");
	notifier_loc_tc_attrib = custom_page_notifier_loc.newAttribute("Top Center", "0");
	notifier_loc_tr_attrib = custom_page_notifier_loc.newAttribute("Top Right", "0");
	addMenuSeparator(custom_page_notifier_loc);
	notifier_loc_vport_attrib = custom_page_notifier_loc.newAttribute("Relative to Viewport", "1");
	notifier_loc_monitor_attrib = custom_page_notifier_loc.newAttribute("Relative to Monitor", "0");

// Notifications > Fade...
	notifier_fdout_alpha = custom_page_notifier_fdout.newAttribute("Alpha Fade ", "1"); 
	notifier_fdout_vslide = custom_page_notifier_fdout.newAttribute("Vertical Slide ", "0");
	notifier_fdout_hslide = custom_page_notifier_fdout.newAttribute("Horizontal Slide ", "0");

	// Martin> We need a additional spacer for the last 3 attribs, so we won't cross withe the 3 below in studio.xnf

	notifier_fdin_alpha = custom_page_notifier_fdin.newAttribute("Alpha Fade", "1");
	notifier_fdin_vslide = custom_page_notifier_fdin.newAttribute("Vertical Slide", "0");
	notifier_fdin_hslide = custom_page_notifier_fdin.newAttribute("Horizontal Slide", "0");

}

#ifdef MAIN_ATTRIBS_MGR

notifier_always_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	notifier_never_attrib.setData("0");
	notifier_minimized_attrib.setData("0");
	notifier_windowshade_attrib.setData("0");
	attribs_mychange = 0;
}

notifier_never_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	notifier_always_attrib.setData("0");
	notifier_minimized_attrib.setData("0");
	notifier_windowshade_attrib.setData("0");
	attribs_mychange = 0;
}

notifier_minimized_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	notifier_never_attrib.setData("0");
	notifier_always_attrib.setData("0");
	notifier_windowshade_attrib.setData("0");
	attribs_mychange = 0;
}

notifier_windowshade_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	notifier_never_attrib.setData("0");
	notifier_always_attrib.setData("0");
	notifier_minimized_attrib.setData("0");
	attribs_mychange = 0;
}

notifier_fdout_alpha.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	notifier_fdout_hslide.setData("0");
	notifier_fdout_vslide.setData("0");
	attribs_mychange = 0;
}
notifier_fdout_hslide.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	notifier_fdout_alpha.setData("0");
	notifier_fdout_vslide.setData("0");
	attribs_mychange = 0;
}
notifier_fdout_vslide.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	notifier_fdout_hslide.setData("0");
	notifier_fdout_alpha.setData("0");
	attribs_mychange = 0;
}

notifier_fdin_alpha.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	notifier_fdin_hslide.setData("0");
	notifier_fdin_vslide.setData("0");
	attribs_mychange = 0;
}
notifier_fdin_hslide.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	notifier_fdin_alpha.setData("0");
	notifier_fdin_vslide.setData("0");
	attribs_mychange = 0;
}
notifier_fdin_vslide.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	notifier_fdin_hslide.setData("0");
	notifier_fdin_alpha.setData("0");
	attribs_mychange = 0;
}

notifier_loc_br_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	notifier_loc_bl_attrib.setData("0");
	notifier_loc_tr_attrib.setData("0");
	notifier_loc_tl_attrib.setData("0");
	notifier_loc_tc_attrib.setData("0");
	notifier_loc_bc_attrib.setData("0");
	attribs_mychange = 0;
}
notifier_loc_bl_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	notifier_loc_br_attrib.setData("0");
	notifier_loc_tr_attrib.setData("0");
	notifier_loc_tl_attrib.setData("0");
	notifier_loc_tc_attrib.setData("0");
	notifier_loc_bc_attrib.setData("0");
	attribs_mychange = 0;
}
notifier_loc_tl_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	notifier_loc_bl_attrib.setData("0");
	notifier_loc_tr_attrib.setData("0");
	notifier_loc_br_attrib.setData("0");
	notifier_loc_tc_attrib.setData("0");
	notifier_loc_bc_attrib.setData("0");
	attribs_mychange = 0;
}
notifier_loc_tr_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	notifier_loc_bl_attrib.setData("0");
	notifier_loc_br_attrib.setData("0");
	notifier_loc_tl_attrib.setData("0");
	notifier_loc_tc_attrib.setData("0");
	notifier_loc_bc_attrib.setData("0");
	attribs_mychange = 0;
}
notifier_loc_tc_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	notifier_loc_bl_attrib.setData("0");
	notifier_loc_br_attrib.setData("0");
	notifier_loc_tl_attrib.setData("0");
	notifier_loc_tr_attrib.setData("0");
	notifier_loc_bc_attrib.setData("0");
	attribs_mychange = 0;
}
notifier_loc_bc_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	notifier_loc_bl_attrib.setData("0");
	notifier_loc_br_attrib.setData("0");
	notifier_loc_tl_attrib.setData("0");
	notifier_loc_tc_attrib.setData("0");
	notifier_loc_tr_attrib.setData("0");
	attribs_mychange = 0;
}

notifier_loc_vport_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	notifier_loc_monitor_attrib.setData("0");
	attribs_mychange = 0;
}
notifier_loc_monitor_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	notifier_loc_vport_attrib.setData("0");
	attribs_mychange = 0;
}

#endif
