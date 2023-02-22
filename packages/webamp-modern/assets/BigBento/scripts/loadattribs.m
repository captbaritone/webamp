/*---------------------------------------------------
-----------------------------------------------------
Filename:	loadattribs.m
Version:	1.2

Type:		maki/attrib loader
Date:		29. Aug. 2006 - 23:43 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#define MAIN_ATTRIBS_MGR
#define MAIN_ATTRIBS_LOADER

#include <lib/std.mi>

#include attribs/init_windowpage.m
#include attribs/init_playlist.m
#include attribs/init_Autoresize.m
#include attribs/init_Vis.m
#include attribs/init_appearance.m
#include attribs/init_songticker.m
#include attribs/init_notifier.m
// #include ../../../Plugins/freeform/xml/wasabi/xml/xui/browser/init_browser.m

#include /home/fathony/Documents/X2NIE/webamp/packages/webamp-modern/assets/freeform/xml/wasabi/xml/xui/browser/init_browser.m

Global Configattribute FontRenderer, findOpenRect;
Global String FontRenderer_default, findOpenRect_default;
Global configAttribute skin_attrib;

System.onScriptLoaded()
{
	initAttribs_Appearance();
	initAttribs_Songticker();
	initAttribs_Autoresize();
	initAttribs_notifier();
	initAttribs_Browser();
	initAttribs_Vis();

	//without optionsmenu entry:
	initAttribs_windowpage();
	initAttribs_Playlist();

	// Add skin switcher to Appearance menu

	addMenuSeparator(custom_page_appearance);

	if (getParam() == "big")
	{
		skin_attrib = custom_page_appearance.newAttribute("Switch to Bento with Small Buttons", "0");
	}
	else
	{
		skin_attrib = custom_page_appearance.newAttribute("Switch to Bento with Big Buttons", "0");
	}

	// Turn 'find open rect' temporary off

	findOpenRect = config.getItemByGuid("{280876CF-48C0-40BC-8E86-73CE6BB462E5}").getAttribute("Find open rect");
	findOpenRect_default = findOpenRect.getData();
	findOpenRect.setData("0");

}

System.onScriptUnloading ()
{
	findOpenRect.setData(findOpenRect_default);
}

findOpenRect.onDataChanged ()
{
	if (getData() == "0") return;
	findOpenRect.setData("0");
}

global boolean passtrough;

skin_attrib.onDataChanged ()
{
	if (passtrough)
	{
		return;
	}
	passtrough = TRUE;
	setData("0");
	if (getParam() == "big") switchSkin("Bento");
	else switchSkin("Big Bento");
	passtrough = FALSE;
}