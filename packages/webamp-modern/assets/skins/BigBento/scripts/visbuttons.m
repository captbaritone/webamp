/*---------------------------------------------------
-----------------------------------------------------
Filename:	visbuttons.m
Version:	1.0
Type:		maki
Date:		16. Aug. 2007 - 23:54 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>

Function updateObjectPosition(int w);

Global Group scriptGroup;
Global Button cfg, prv, nxt, rnd, rnda;
Global Boolean isBig;

System.onScriptLoaded ()
{
	scriptGroup = getScriptGroup();

	cfg = scriptGroup.findObject("vis.cfg");
	prv = scriptGroup.findObject("vis.prv");
	nxt = scriptGroup.findObject("vis.nxt");
	rnd = scriptGroup.findObject("vis.rnd");
	rnda = scriptGroup.findObject("vis.rnd.active");

	isBig = (prv.getGuiX() == 31);
}

scriptGroup.onResize (int x, int y, int w, int h)
{
	updateObjectPosition(w);
}

updateObjectPosition (int w)
{
	if (isBig)
	{
		if (w >= 246)
		{
			cfg.show();
			prv.show();
			rnd.show();
			rnda.show();
			nxt.show();
		}
		else if (w >= 217)
		{
			cfg.show();
			prv.show();
			rnd.show();
			rnda.show();
			nxt.hide();
		}
		else if (w >= 186)
		{
			cfg.show();
			prv.show();
			rnd.hide();
			rnda.hide();
			nxt.hide();
		}
		else if (w >= 155)
		{
			cfg.show();
			prv.hide();
			rnd.hide();
			rnda.hide();
			nxt.hide();
		}
		else
		{
			cfg.hide();
			prv.hide();
			rnd.hide();
			rnda.hide();
			nxt.hide();
		}
		return;
	}

	if (w >= 192)
	{
		cfg.show();
		prv.show();
		rnd.show();
		rnda.show();
		nxt.show();
	}
	else if (w >= 168)
	{
		cfg.show();
		prv.show();
		rnd.show();
		rnda.show();
		nxt.hide();
	}
	else if (w >= 144)
	{
		cfg.show();
		prv.show();
		rnd.hide();
		rnda.hide();
		nxt.hide();
	}
	else if (w >= 120)
	{
		cfg.show();
		prv.hide();
		rnd.hide();
		rnda.hide();
		nxt.hide();
	}
	else
	{
		cfg.hide();
		prv.hide();
		rnd.hide();
		rnda.hide();
		nxt.hide();
	}
}