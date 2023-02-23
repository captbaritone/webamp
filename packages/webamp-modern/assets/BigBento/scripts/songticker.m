/*---------------------------------------------------
-----------------------------------------------------
Filename:	songticker.m
Version:	1.0

Type:		maki
Date:		18. Nov. 2006 - 16:08 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>
#include attribs/init_songticker.m

Function setTextW();
Function updateTickerScrolling();

Global Timer SongTickerTimer;
Global GuiObject SongTicker;
Global Text SongTime, InfoDisplay;
Global int SongTicker_x, SongTicker_w, total_w;
Global int SongTime_x, SongTime_w, offset_x;

Global Boolean isShade, byPassTimer;

System.onScriptLoaded ()
{
	initAttribs_Songticker();

	group sg = getScriptGroup();

	if (sg.getParentLayout().getID() == "shade") isShade = TRUE;	

	SongTicker = sg.findObject("songticker");
	InfoDisplay = sg.findObject("InfoDisplay");
	SongTickerTimer = new Timer;
	SongTickerTimer.setDelay(666);

	SongTime = sg.findObject("SongTime");

	SongTicker_x = SongTicker.getGuiX();
	SongTicker_w = SongTicker.getGuiW();

	total_w = SongTicker_x + SongTicker_w;

	SongTime_x = SongTime.getGuiX();
	SongTime_w = SongTime.getTextWidth();

	offset_x = stringToInteger(getParam());

	setTextW();

	updateTickerScrolling();

}

System.onScriptUnloading ()
{
	SongTickerTimer.stop();
	delete SongTickerTimer;
}

SongTicker.onAction (String action, String param, Int x, int y, int p1, int p2, GuiObject source)
{
	if (strlower(action) == "showinfo")
	{
		SongTicker.cancelTarget();
		SongTicker.setAlpha(0);
		SongTickerTimer.start();
		InfoDisplay.setText(param);
		InfoDisplay.setAlpha(255);

	}
	else if (strlower(action) == "cancelinfo")
	{
		SongTickerTimer.onTimer ();
	}
	else if (strlower(action) == "setguix")
	{
		byPassTimer = TRUE;
		SongTicker_X = x;
		SongTicker_W = total_w - SongTicker_X;
		SongTicker.setXmlParam("x", integerToString(SongTicker_X));
		InfoDisplay.setXmlParam("x", integerToString(SongTicker_X));
		SongTicker.setXmlParam("w", integerToString(SongTicker_W));
		InfoDisplay.setXmlParam("w", integerToString(SongTicker_W));
	}
	else if (strlower(action) == "restoreguix")
	{
		byPassTimer = FALSE;
		setTextW ();
	}
}

SongTickerTimer.onTimer ()
{
	SongTickerTimer.stop();
	InfoDisplay.cancelTarget();
	InfoDisplay.setTargetA(0);
	InfoDisplay.setTargetSpeed(0.3);
	InfoDisplay.gotoTarget();
}

InfoDisplay.onTargetReached ()
{
	if (getAlpha() == 0)
	{
		setTextW ();
		Songticker.cancelTarget();
		Songticker.setTargetA(255);
		Songticker.setTargetX(Songticker.getGuiX());
		Songticker.setTargetW(Songticker.getGuiW());
		Songticker.setTargetSpeed(0.3);
		Songticker.gotoTarget();
	}
}

/* Changing TickerScrolling via Config Attrib */

ScrollingAttribute.onDataChanged () 
{
	setTextW ();
	updateTickerScrolling();
}

updateTickerScrolling ()
{
	if (Songticker == NULL)
	{
		return;
	}
	
	if (songticker_scrolling_disabled_attrib.getData() == "1") SongTicker.setXMLParam("ticker", "off");
	if (songticker_style_modern_attrib.getData() == "1") SongTicker.setXMLParam("ticker", "bounce");
	if (songticker_style_old_attrib.getData() == "1") SongTicker.setXMLParam("ticker", "scroll");
}

/* set Songticker Position */

setTextW ()
{
	if (byPassTimer) return;

	if (Songticker == NULL || InfoDisplay == NULL)
	{
		return;
	}

	SongTicker_X = SongTime_X + SongTime_w + offset_x;
	SongTicker_W = total_w - SongTicker_X;

	/*if (!isShade)
	{
		if (SongTime_w > 89)
		{
			SongTime.setXmlParam("x", "0");
			SongTicker_X = SongTime_X + SongTime_w + offset_x - 11;
			SongTicker_W = total_w - SongTicker_X + 11;
		}
		else
		{
			SongTime.setXmlParam("x", "10");
		}		
	}*/
	
	// debugString(system.getScriptGroup().getParentLayout().getID() + " -- x: " + integerToString(SongTicker_X) + " -- w: " + integerToString(SongTicker_W), 9);

	Songticker.setXmlParam("x", integerToString(SongTicker_X));
	Songticker.setXmlParam("w", integerToString(SongTicker_W));
	InfoDisplay.setXmlParam("x", integerToString(SongTicker_X));
	InfoDisplay.setXmlParam("w", integerToString(SongTicker_W));
}

SongTime.onTextChanged (String newtxt)
{
	int temp_w = SongTime.getTextWidth();
	if (SongTime_w == temp_w) return;

	SongTime_w = temp_w;
	setTextW ();
}

songticker.onTargetReached ()
{
	setTextW ();
}