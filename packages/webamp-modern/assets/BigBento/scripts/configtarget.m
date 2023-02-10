/*---------------------------------------------------
-----------------------------------------------------
Filename:	configtarget.m
Version:	2.1

Type:		maki
Date:		04. Jan. 2007 - 22:46 
Edited by:	Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu

Note:		This script is based on configtarget.m
		from Winamp Modern
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>

// ------------------------------------------------------------------------------------
Global GuiObject target;
Global ComponentBucket buck;

Global GuiObject last, current;
// ------------------------------------------------------------------------------------
Function turnAllOffExcept(GuiObject except);
Function turnOn(GuiObject obj);
Function turnOff(GuiObject obj);

//Member int target.fff;

//function fff();
//Member button int fff();
// ------------------------------------------------------------------------------------


// ------------------------------------------------------------------------------------
// init
// ------------------------------------------------------------------------------------
System.onScriptLoaded()
{
	target = getScriptGroup().findObject("skin.config.target");
	buck = getScriptGroup().findObject("my.bucket");

	last = NULL;
	current = NULL;

	//debugInt(guiobject.fff);ffff

//	target.fff = 4;

	// turn off all
	GuiObject o = NULL;
	turnAllOffExcept(o);
}

// ------------------------------------------------------------------------------------
// save scroller position
// ------------------------------------------------------------------------------------
/*System.onScriptUnloading()
{
	if (buck)
	{
		setPrivateInt(getSkinName(), "", buck.getScroll());
	}
}*/

// ------------------------------------------------------------------------------------
// turn on last open
// ------------------------------------------------------------------------------------
buck.onStartup()
{
	//setScroll(getPrivateInt(getSkinName(), "settings_last_pos", 0));
	Group g = buck.enumChildren(getPrivateInt(getSkinName(), "settings_last_pos", 0));
	if (!g) g = buck.enumChildren(0);
	if (!g) return;
	ToggleButton btn = g.getObject("btn");
	if (btn) btn.leftClick();
}

// ------------------------------------------------------------------------------------
// this is called by the bucket button to switch to a new group
// ------------------------------------------------------------------------------------
target.onAction(String action, String param, int x, int y, int p1, int p2, GuiObject source)
{
	if (getToken(action,";",0) == "switchto")
	{
		String grp = getToken(action, ";", 1);
		String is_subpage = getToken(action, ";", 2);

		if (current != NULL)
		{
			last = current;
		}

		target.setXmlParam("groupid", grp);

		current = getScriptGroup().findObject(grp);

	//	setPrivateInt(getSkinName(), "settings_last_pos", stringToInteger(param));

		if (is_subpage!="subpage") turnAllOffExcept(source.getParent()); // getParent because the source is the button itself, the parent is the whole group item in the bucket
	}
}

// Hack to hide last item

last.onTargetReached ()
{
	if (getAlpha() == 0)
	{
		hide();
	}
}

// ------------------------------------------------------------------------------------
// turn off all buttons except for the parameter, also save last_page param based on param item
// ------------------------------------------------------------------------------------
turnAllOffExcept(GuiObject except)
{
	if (!buck) return;
	int i=0;
	// enumerate all inserted groups, turn them off if they're not our exception
	while (i<buck.getNumChildren())
	{
		GuiObject obj = buck.enumChildren(i);
		if (obj == except)
		{ // otherwise record last page
			setPrivateInt(getSkinName(), "settings_last_pos", i);
			i++;
			continue;
		}
		if (obj == NULL) { break; } // shoundnt happen
		turnOff(obj);
		i++;
	}
	// turn on the clicked item
	if (except) turnOn(except);
}

// ------------------------------------------------------------------------------------
turnOn(GuiObject obj)
{
	Group gobj = obj;

	// otherwise we just need this :
	ToggleButton tg = gobj.getObject("btn");
	tg.setActivated(1);
}

// ------------------------------------------------------------------------------------
turnOff(GuiObject obj)
{
	Group gobj = obj;

	// otherwise we just need this :
	ToggleButton tg = gobj.getObject("btn");
	tg.setActivated(0);
}