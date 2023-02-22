/*---------------------------------------------------
-----------------------------------------------------
Filename:	init_vis.m
Version:	1.0

Type:		maki/attrib definitions
Date:		03. Nov. 2006 - 18:12	
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
Depending Files:
		scripts/infocompcore.maki
		scripts/suicore.maki
-----------------------------------------------------
---------------------------------------------------*/

#ifndef included
#error This script can only be compiled as a #include
#endif

#include "gen_pageguids.m"


Function initAttribs_vis();

Global ConfigAttribute vis_lefttoplayer_attrib, vis_inbig_attrib, vis_lefttoplayer_full_attrib;

#define CUSTOM_PAGE_VIS "{090B63DE-FD24-4528-ABE5-A522615E8AE9}"


initAttribs_vis()
{
	initPages();

	ConfigItem vis_parent = addConfigSubMenu(optionsmenu_page, "Visualization", CUSTOM_PAGE_VIS);

	vis_inbig_attrib = vis_parent.newAttribute("Open in Big Component View", "1");
	vis_lefttoplayer_full_attrib = vis_parent.newAttribute("Open in Multi Content View (stretched)", "0");
	vis_lefttoplayer_attrib = vis_parent.newAttribute("Open in Multi Content View (mini)", "0");
}

#ifdef MAIN_ATTRIBS_MGR

vis_lefttoplayer_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	vis_inbig_attrib.setData("0");
	vis_lefttoplayer_full_attrib.setData("0");
	attribs_mychange = 0;
}

vis_inbig_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	vis_lefttoplayer_attrib.setData("0");
	vis_lefttoplayer_full_attrib.setData("0");
	attribs_mychange = 0;
}

vis_lefttoplayer_full_attrib.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	vis_lefttoplayer_attrib.setData("0");
	vis_inbig_attrib.setData("0");
	attribs_mychange = 0;
}

#endif