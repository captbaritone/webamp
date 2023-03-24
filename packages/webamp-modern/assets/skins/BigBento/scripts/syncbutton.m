/*---------------------------------------------------
-----------------------------------------------------
Filename:	syncbutton.m
Version:	1.0

Type:		maki
Date:		25. Jun. 2007 - 14:04 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>

Global GuiObject mainButton, activeOverlay;
Global Boolean mouseDown;
Global Int activeOverlay_Y;

System.onScriptLoaded ()
{
	mainButton = getScriptGroup().findObject(getToken(getParam(), ";", 0));
	activeOverlay = getScriptGroup().findObject(getToken(getParam(), ";", 1));
	activeOverlay_Y = activeOverlay.getGuiY();
	mainButton.onsetvisible(mainButton.isvIsible());
}

mainButton.onLeftButtonDown (int x, int y)
{
	mouseDown = 1;
	activeOverlay.setXmlParam("y", integerToString(activeOverlay_Y+1));
}

mainButton.onLeftButtonUp (int x, int y)
{
	mouseDown = 0;
	activeOverlay.setXmlParam("y", integerToString(activeOverlay_Y));
}

mainButton.onleaveArea ()
{
	activeOverlay.setXmlParam("y", integerToString(activeOverlay_Y));
}

mainButton.onEnterArea ()
{
	if (mouseDown) activeOverlay.setXmlParam("y", integerToString(activeOverlay_Y+1));
}

mainButton.onSetVisible (Boolean onoff)
{
	if (onoff) activeOverlay.show();
	else activeOverlay.hide();
}
