/*---------------------------------------------------
-----------------------------------------------------
Filename:	tabcontrol.m
Version:	1.0

Type:		maki
Date:		30. Okt. 2007 - 17:40  
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>

Function updateTabPos();
Function setAutoWidth(guiobject tab);

Class Text WatchText;

Global Boolean HAVE_ML;

Global GuiObject tabMl, tabVideo, tabVis, tabBrowser;
Global WatchText txtMl, txtVideo, txtVis, txtBrowser;
Global int startX, curX;

System.onScriptLoaded ()
{
	HAVE_ML = stringToInteger(getParam());

	group sg = getScriptGroup();

	tabML = sg.findObject("switch.ml");
	txtMl = tabMl.findObject("bento.tabbutton.normal.text");
	tabVis = sg.findObject("switch.vis");
	txtVis = tabMl.findObject("bento.tabbutton.normal.text");
	tabVideo = sg.findObject("switch.video");
	txtVideo = tabMl.findObject("bento.tabbutton.normal.text");
	tabBrowser = sg.findObject("switch.browser");
	txtBrowser = tabMl.findObject("bento.tabbutton.normal.text");

	startX = tabMl.getGuiX();

	updateTabPos();
}

updateTabPos ()
{	
	curX = startX;
	if (!HAVE_ML)
	{
		tabMl.hide();
	}
	else
	{
		curX += setAutoWidth(tabMl) + 1;
	}

	tabVideo.setXmlParam("x", integerToString(curX));
	curX += setAutoWidth(tabVideo) + 1;

	tabVis.setXmlParam("x", integerToString(curX));
	curX += setAutoWidth(tabVis) + 1;

	tabBrowser.setXmlParam("x", integerToString(curX));
	curX += setAutoWidth(tabBrowser) + 1;
}

int setAutoWidth (guiObject tab)
{
	text source = tab.findObject("bento.tabbutton.normal.text");
	int x = stringToInteger(source.getXmlparam("x"));
	int w = source.getAutoWidth();

	tab.setXmlParam("w", integerToString(2*x+w));

	return 2*x + w;
}