/*---------------------------------------------------
-----------------------------------------------------
Filename:	timecontrol.m
Version:	1.0

Type:		maki
Date:		29. Jun. 2007 - 00:13 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>
#include <lib/config.mi>
#include <lib/AutoRepeatButton.m>

Function updateAttrib (int val);

Global ConfigAttribute timeAttrib;
Global text Display;
Global AutoRepeatButton Increase, Decrease;
Global float multiplier;
Global int maxvalue, step;
Global string suffix;
Global boolean myChange;

System.onScriptLoaded ()
{
	AutoRepeat_Load();
	string param = getParam();

	string objects = getToken(param, "|", 0);
	group scriptGroup = getScriptGroup();
	Display = scriptGroup.findObject(getToken(objects, ";", 0));
	Decrease = scriptGroup.findObject(getToken(objects, ";", 1));
	Increase = scriptGroup.findObject(getToken(objects, ";", 2));

	objects = getToken(param, "|", 1);
	timeAttrib = config.getItemByGuid(getToken(objects, ";", 0)).getattribute(getToken(objects, ";", 1));

	step = stringToInteger(getToken(param, "|", 2));
	maxvalue = stringToInteger(getToken(param, "|", 3));
	multiplier = stringToFloat(getToken(param, "|", 4));
	suffix = getToken(param, "|", 5);

	AutoRepeat_SetInitalDelay(250);
	AutoRepeat_SetRepeatDelay(125);

	updateAttrib (0);
}

System.onScriptUnloading ()
{
	AutoRepeat_Unload();
}

Increase.onLeftClick ()
{
	if (!AutoRepeat_ClickType) return;
	updateAttrib (step);
}

Decrease.onLeftClick ()
{
	if (!AutoRepeat_ClickType) return;
	updateAttrib (-step);
}

timeAttrib.onDataChanged ()
{
	if (myChange) return;
	updateAttrib (0);
}

updateAttrib (int val)
{
	float i = stringToInteger(timeAttrib.getData());
	i += val;
	if (i < 0 || i > maxvalue) return;
	myChange = 1;
	string s = integerToString(i);
	if (timeAttrib) timeAttrib.setData(s);
	i *= multiplier;
	s = floatToString(i,1);
	Display.setText(s + suffix);
	myChange = 0;
}	