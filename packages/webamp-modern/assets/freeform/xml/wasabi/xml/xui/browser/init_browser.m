/*---------------------------------------------------
-----------------------------------------------------
Filename:	init_browser.m
Version:	1.1

Type:		maki/attrib definitions
Date:		27. Jul. 2007 - 13:36 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
Depending Files:
		scripts/browser.maki
-----------------------------------------------------
---------------------------------------------------*/

#ifndef included
#error This script can only be compiled as a #include
#endif

#include "gen_pageguids.m"

#define CUSTOM_PAGE_BROWSER "{0E17DBEA-9398-49e6-AE6F-3AB17D001DF3}"
#define CUSTOM_PAGE_BROWSER_WASEARCH "{180E87DF-C482-41fe-A570-8575C673E1BA}"
#define CUSTOM_PAGE_BROWSER_CONCERTSEARCH "{B8171DB3-ECF6-40c6-9332-DDEA57A8F13E}"

Function initAttribs_browser();

Class ConfigAttribute SearchAttribute;
Function check (string unknown, SearchAttribute compare);

#ifdef BROWSER_SCRIPT
Global list SearchAttributeList;
#endif
#ifndef BROWSER_SCRIPT
#define SearchAttributeList //
#endif

Global ConfigAttribute browser_scr_show_attrib, browser_search_attrib;
Global SearchAttribute browser_search_winamp_mskins_attrib, browser_search_winamp_cskins_attrib, browser_search_winamp_plugins_attrib,
					   browser_search_winamp_web_attrib, browser_search_wiki_attrib, browser_c_pollstar_attrib, browser_c_bit_attrib,
					   browser_c_jambase_attrib;

initAttribs_browser()
{
	initPages();

	ConfigItem custom_page_browser = addConfigSubMenu(optionsmenu_page, "Browser", CUSTOM_PAGE_BROWSER);

	browser_search_attrib = custom_page_nonexposed.newAttribute("Onesie browser Quicksearch", "Web Search");

	SearchAttributeList = new List;
	SearchAttributeList.addItem (custom_page_browser);

	browser_search_winamp_web_attrib = custom_page_browser.newAttribute("Web Search", "1");
	SearchAttributeList.addItem (browser_search_winamp_web_attrib);

	browser_search_wiki_attrib = custom_page_browser.newAttribute("Wikipedia Search", "0");
	SearchAttributeList.addItem (browser_search_wiki_attrib);

	ConfigItem custom_page_browser_concertsearch = addConfigSubMenu(custom_page_browser, "Concert Search", CUSTOM_PAGE_BROWSER_CONCERTSEARCH);

	browser_c_jambase_attrib = custom_page_browser_concertsearch.newAttribute("JamBase", "0");
	SearchAttributeList.addItem (browser_c_jambase_attrib);

	browser_c_pollstar_attrib = custom_page_browser_concertsearch.newAttribute("Pollstar", "0");
	SearchAttributeList.addItem (browser_c_pollstar_attrib);

	browser_c_bit_attrib = custom_page_browser_concertsearch.newAttribute("Bandsintown", "0");
	SearchAttributeList.addItem (browser_c_bit_attrib);

	ConfigItem custom_page_browser_winampsearch = addConfigSubMenu(custom_page_browser, "Winamp.com Search", CUSTOM_PAGE_BROWSER_WASEARCH);
	browser_search_winamp_mskins_attrib = custom_page_browser_winampsearch.newAttribute("Modern Skins", "0");
	SearchAttributeList.addItem (browser_search_winamp_mskins_attrib);
	browser_search_winamp_cskins_attrib = custom_page_browser_winampsearch.newAttribute("Classic Skins", "0");
	SearchAttributeList.addItem (browser_search_winamp_cskins_attrib);
	browser_search_winamp_plugins_attrib = custom_page_browser_winampsearch.newAttribute("Plug-ins", "0");
	SearchAttributeList.addItem (browser_search_winamp_plugins_attrib);

	addMenuSeparator(custom_page_browser);

	browser_scr_show_attrib = custom_page_browser.newAttribute("Show Media Monitor", "1");

}

#ifdef MAIN_ATTRIBS_MGR

browser_search_attrib.onDataChanged ()
{
	if (attribs_mychange) return;
	string dta = getData();
	if (dta == "Modern Skins") browser_search_winamp_mskins_attrib.setData("1");
	else if (dta == "Classic Skins") browser_search_winamp_plugins_attrib.setData("1");
	else if (dta == "Plug-ins") browser_search_winamp_plugins_attrib.setData("1");
	else if (dta == "Web Search with Google") browser_search_winamp_web_attrib.setData("1");
	else if (dta == "Pollstar") browser_c_pollstar_attrib.setData("1");
	else if (dta == "Bands in Town") browser_c_bit_attrib.setData("1");
	else if (dta == "JamBase") browser_c_jambase_attrib.setData("1");
	else if (dta == "Wikipedia Search") browser_search_wiki_attrib.setData("1");
}

SearchAttribute.onDataChanged()
{
	if (attribs_mychange) return;
	NOOFF
	attribs_mychange = 1;
	String s = SearchAttribute.getAttributeName();
	check (s, browser_search_winamp_mskins_attrib);
	check (s, browser_search_winamp_cskins_attrib);
	check (s, browser_search_winamp_plugins_attrib);
	check (s, browser_search_winamp_web_attrib);
	check (s, browser_c_jambase_attrib);
	check (s, browser_c_bit_attrib);
	check (s, browser_c_pollstar_attrib);
	check (s, browser_search_wiki_attrib);

	attribs_mychange = 0;
}

check (String unknown, SearchAttribute compare)
{
	if (unknown == compare.getAttributeName())
	{
		browser_search_attrib.setData(compare.getAttributeName());
	}
	else
	{
		compare.setData("0");
	}
}

#endif