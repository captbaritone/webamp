/*---------------------------------------------------
-----------------------------------------------------
Filename:	tabbutton.m
Version:	1.0

Type:		maki
Date:		28. Sep. 2007 - 13:12 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>

Global GuiObject normalGrid, hoverGrid, activeGrid, footerGrid;
Global Button mousetrap;
Global Text normalText, hoverText, activeText;
Global Boolean mouseDown;

System.onScriptLoaded ()
{
	group sg = getScriptGroup();

	normalGrid = sg.getObject("bento.tabbutton.normal");
	hoverGrid = sg.getObject("bento.tabbutton.hover");
	activeGrid = sg.getObject("bento.tabbutton.active");
	normalText = sg.getObject("bento.tabbutton.normal.text");
	hoverText = sg.getObject("bento.tabbutton.hover.text");
	activeText = sg.getObject("bento.tabbutton.active.text");
	footerGrid = sg.getObject("bento.tabbutton.footer");

	mousetrap = sg.getObject("bento.tabbutton.mousetrap");
}

System.onSetXuiParam (String stringParam, String value)
{
	if ( strlower(stringParam) == "tabtext" ) 
	{
		normalText.setText(value);
		hoverText.setText(value);
		activeText.setText(value);
	}
}

mousetrap.onLeftButtonDown (int x, int y)
{
	mouseDown = 1;
	normalGrid.show();
	hoverGrid.hide();
	normalText.show();
	hoverText.hide();
}

mousetrap.onLeftButtonUp (int x, int y)
{
	mouseDown = 0;
	if (!getActivated() && isMouseOverRect()) { normalGrid.hide(); hoverGrid.show(); normalText.hide(); hoverText.show(); }
}

mousetrap.onleaveArea ()
{
	normalGrid.show(); 
	hoverGrid.hide();
	normalText.show();
	hoverText.hide();
}

mousetrap.onEnterArea ()
{
	normalGrid.hide(); hoverGrid.show(); normalText.hide(); hoverText.show();
}

mousetrap.onActivate (int activated)
{
	if (activated)
	{
		normalGrid.hide(); hoverGrid.hide(); normalText.hide(); hoverText.hide();
		activeGrid.show(); footerGrid.show(); activeText.show();
	}
	else
	{
		normalGrid.show(); hoverGrid.hide(); normalText.show(); hoverText.hide();
		activeGrid.hide(); footerGrid.hide(); activeText.hide();
	}
}