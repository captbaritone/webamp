/*---------------------------------------------------
-----------------------------------------------------
Filename:	imagecontrol.m
Version:	1.0

Type:		maki
Date:		29. Jun. 2007 - 12:28 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>
#include <lib/config.mi>

Function updateAttrib ();
Class ConfigAttribute ImageAttribute;

Global ImageAttribute a1, a2, a3, a4, a5, a6;
Global String img1, img2, img3, img4, img5, img6;
Global layer Display;
Global boolean myChange;

System.onScriptLoaded ()
{
	string param = getParam();

	string objects = getToken(param, "|", 0);
	group scriptGroup = getScriptGroup();
	Display = scriptGroup.findObject(objects);


	int n = stringToInteger(getToken(param, "|", 1)) + 1;
	int i = 2;
	if (i <= n)
	{
		objects = getToken(param, "|", i);
		a1 = config.getItemByGuid(getToken(objects, ";", 0)).getattribute(getToken(objects, ";", 1));
		img1 = getToken(objects, ";", 2);
		i++;
	}
	if (i <= n)
	{
		objects = getToken(param, "|", i);
		a2 = config.getItemByGuid(getToken(objects, ";", 0)).getattribute(getToken(objects, ";", 1));
		img2 = getToken(objects, ";", 2);
		i++;
	}
	if (i <= n)
	{
		objects = getToken(param, "|", i);
		a3 = config.getItemByGuid(getToken(objects, ";", 0)).getattribute(getToken(objects, ";", 1));
		img3 = getToken(objects, ";", 2);
		i++;
	}
	if (i <= n)
	{
		objects = getToken(param, "|", i);
		a4 = config.getItemByGuid(getToken(objects, ";", 0)).getattribute(getToken(objects, ";", 1));
		img4 = getToken(objects, ";", 2);
		i++;
	}
	if (i <= n)
	{
		objects = getToken(param, "|", i);
		a5 = config.getItemByGuid(getToken(objects, ";", 0)).getattribute(getToken(objects, ";", 1));
		img5 = getToken(objects, ";", 2);
		i++;
	}
	if (i <= n)
	{
		objects = getToken(param, "|", i);
		a6 = config.getItemByGuid(getToken(objects, ";", 0)).getattribute(getToken(objects, ";", 1));
		img6 = getToken(objects, ";", 2);
		i++;
	}

	updateAttrib ();
}

ImageAttribute.onDataChanged ()
{
	if (myChange) return;
	updateAttrib ();
}

updateAttrib ()
{
	myChange = 1;
	if (a1) if (a1.getData() == "1") Display.setXmlParam("image", img1);
	if (a2) if (a2.getData() == "1") Display.setXmlParam("image", img2);
	if (a3) if (a3.getData() == "1") Display.setXmlParam("image", img3);
	if (a4) if (a4.getData() == "1") Display.setXmlParam("image", img4);
	if (a5) if (a5.getData() == "1") Display.setXmlParam("image", img5);
	if (a6) if (a6.getData() == "1") Display.setXmlParam("image", img6);
	myChange = 0;
}