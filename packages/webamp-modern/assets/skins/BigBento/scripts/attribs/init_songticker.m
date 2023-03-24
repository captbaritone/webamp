/*---------------------------------------------------
-----------------------------------------------------
Filename:	init_songticker.m
Version:	1.0

Type:		maki/attrib definitions
Date:		01. Sep. 2007 - 01:10 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
Depending Files:
		scripts/songticker.maki
-----------------------------------------------------
---------------------------------------------------*/

#ifndef included
#error This script can only be compiled as a #include
#endif

#include "gen_pageguids.m"

Function initAttribs_Songticker();

Class ConfigAttribute ScrollingAttribute;

#define CUSTOM_PAGE_SONGTICKER "{7061FDE0-0E12-11D8-BB41-0050DA442EF4}"


Global ScrollingAttribute songticker_scrolling_disabled_attrib;
Global ScrollingAttribute songticker_style_modern_attrib;
Global ScrollingAttribute songticker_style_old_attrib;


initAttribs_Songticker()
{

	initPages();

	ConfigItem custom_page_songticker = addConfigSubMenu(optionsmenu_page, "Songticker", CUSTOM_PAGE_SONGTICKER);

	songticker_scrolling_disabled_attrib = custom_page_songticker.newAttribute("Disable Songticker Scrolling", "0");
	songticker_style_modern_attrib = custom_page_songticker.newAttribute("Modern Songticker Scrolling", "1");
	songticker_style_old_attrib = custom_page_songticker.newAttribute("Classic Songticker Scrolling", "0");

}

#ifdef MAIN_ATTRIBS_MGR


songticker_scrolling_disabled_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	songticker_style_modern_attrib.setData("0");
	songticker_style_old_attrib.setData("0");
	attribs_mychange = 0;
}


songticker_style_old_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	songticker_style_modern_attrib.setData("0");
	songticker_scrolling_disabled_attrib.setData("0");
	attribs_mychange = 0;
}
songticker_style_modern_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	songticker_scrolling_disabled_attrib.setData("0");
	songticker_style_old_attrib.setData("0");
	attribs_mychange = 0;
}

#endif