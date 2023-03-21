/*---------------------------------------------------
-----------------------------------------------------
Filename:	hoverstimulate.m
Version:	1.0

Type:		maki
Date:		03. Jul. 2007 - 23:09 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>

Global Button mainButton;
Global Layer overlay;
Global Boolean mouseDown;
Global String img_normal, img_hover, img_down, img_active;

System.onScriptLoaded ()
{
	mainButton = getScriptGroup().findObject(getToken(getParam(), ";", 0));
	overlay = getScriptGroup().findObject(getToken(getParam(), ";", 1));
	img_normal = getToken(getParam(), ";", 2);
	img_hover = getToken(getParam(), ";", 3);
	img_down = getToken(getParam(), ";", 4);
	img_active = getToken(getParam(), ";", 5);
}

mainButton.onSetVisible (Boolean onoff)
{
	if (onoff)
	{
		overlay.show();
	}
	else
	{
		overlay.hide();
	}
}

mainButton.onLeftButtonDown (int x, int y)
{
	mouseDown = 1;
	if (img_down != "NULL") overlay.setXmlParam("image", img_down);
}

mainButton.onLeftButtonUp (int x, int y)
{
	mouseDown = 0;
	if (img_hover != "NULL" && !getActivated() && isMouseOverRect()) overlay.setXmlParam("image", img_hover);
}

mainButton.onleaveArea ()
{
	if (!getActivated())
	{
		if (img_normal != "NULL") overlay.setXmlParam("image", img_normal);
	}
	else
	{
		if (img_active != "NULL") overlay.setXmlParam("image", img_active);
	}
}

mainButton.onEnterArea ()
{
	if (img_hover != "NULL") overlay.setXmlParam("image", img_hover);
}

mainButton.onActivate (int activated)
{
	if (activated)
	{
		if (img_active != "NULL") overlay.setXmlParam("image", img_active);
	}
	else
	{
		if (img_normal != "NULL") overlay.setXmlParam("image", img_normal);
	}
}