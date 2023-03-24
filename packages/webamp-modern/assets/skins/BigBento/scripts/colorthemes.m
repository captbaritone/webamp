/*---------------------------------------------------
-----------------------------------------------------
Filename:	colorthemes.m
Version:	1.0

Type:		maki
Date:		29. Jun. 2007 - 13:06 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>

Global Group scriptGroup;
Global GuiObject ColorthemesList, parent;
Global string sgID;

Global Button getmore;


System.onScriptLoaded ()
{
	scriptGroup = getScriptGroup();
	sgID = scriptGroup.getID();
	ColorthemesList = scriptGroup.getObject("colorthemes");
	parent = scriptGroup.getParent().findObject("skin.config.target");

	getmore = scriptGroup.getObject("colorthemes.more");
}

scriptGroup.onTargetReached ()
{
	if (getAlpha() == 0) ColorthemesList.hide();
	else ColorthemesList.show();
}

parent.onAction(String action, String param, int x, int y, int p1, int p2, GuiObject source)
{
	if (getToken(action,";",0) == "switchto")
	{
		if (getToken(action, ";", 1) == sgID)
		{
			ColorthemesList.show();
		}
		else ColorthemesList.hide();
	}
}

getmore.onLeftClick ()
{
	group sui = scriptGroup.getParentLayout().findObject("sui.content");
	sui.sendAction ("browser_navigate", "http://forums.winamp.com/showthread.php?threadid=276371", 0, 0, 0, 0);
}