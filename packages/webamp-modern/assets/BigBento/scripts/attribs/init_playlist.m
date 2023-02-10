/*---------------------------------------------------
-----------------------------------------------------
Filename:	init_playlist.m
Version:	1.0

Type:		maki/attrib definitions
Date:		23. Okt. 2006 - 16:58  
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
Depending Files:
		config/configsystem.maki
-----------------------------------------------------
---------------------------------------------------*/

#ifndef included
#error This script can only be compiled as a #include
#endif

#include "gen_pageguids.m"

#define COSTUM_PAGE_PLAYLIST "{0167CFD9-5D35-404a-8F03-80ED5B89DEDF}"


Function initAttribs_playlist();

Global ConfigAttribute playlist_enlarge_attrib;
Global ConfigAttribute playlist_cover_attrib;

initAttribs_Playlist()
{
	initPages();

	ConfigItem playlist_parent = addConfigSubMenu(optionsmenu_page, "Playlist", COSTUM_PAGE_PLAYLIST);

	playlist_enlarge_attrib = playlist_parent.newAttribute("Enlarge Playlist", "0");

	playlist_cover_attrib = playlist_parent.newAttribute("Show Album Art if Playlist is enlarged", "0");

}