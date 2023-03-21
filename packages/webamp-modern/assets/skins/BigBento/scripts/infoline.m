/*---------------------------------------------------
-----------------------------------------------------
Filename:	infoline.m
Version:	1.0

Type:		maki
Date:		06. Nov. 2007 - 22:40 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>

Global Text txt;
Global Text label;
Global Layer link;
Global Group sg;
Global Int shift = 0;

System.onScriptLoaded ()
{
	sg = getScriptGroup();

	txt = sg.getObject("text");
	label = sg.getObject("label");
	link = sg.getObject("link");
}

System.onSetXuiParam (String param, String value)
{
	if (strlower(param) == "shift") shift = stringToInteger(value);	
	if (strlower(param) == "label") label.setText(value);
	if (strlower(param) == "link") link.setXmlparam("tooltip", value);
}

label.onTextChanged (String newtxt)
{
	int w = label.getAutoWidth() + shift;
	txt.setXmlParam("x", integerToString(w));
	txt.setXmlParam("w", integerToString(-w));
}