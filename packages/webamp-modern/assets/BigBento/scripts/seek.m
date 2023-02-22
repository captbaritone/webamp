/*---------------------------------------------------
-----------------------------------------------------
Filename:	seek.m
Version:	1.2

Type:		maki
Date:		23. Jul. 2007 - 22:52 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu

Note:		This script is based on seek.m
		from Winamp Modern
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>

Global Group frameGroup;
Global Slider Seeker, SeekerBehind;
Global Int Seeking;
Global GuiObject SongTicker;
Global GuiObject progressBar;

System.onScriptLoaded()
{
	frameGroup = system.getScriptGroup();
	Seeker = frameGroup.findObject("seeker.ghost");
	SeekerBehind = frameGroup.findObject("seeker.ghost");
	progressBar = frameGroup.findObject("progressbar");
	SongTicker = frameGroup.getParentLayout().findObject("songticker");

	progressBar.hide();
progressBar.show();

	if (getStatus() == 0 || !seeker.isvisible())
	{
		progressBar.hide();
	}
}

Seeker.onSetPosition(int p) {
	if (seeking) {
		Float f;
		f = p;
		f = f / 255 * 100;
		Float len = getPlayItemLength();
		if (len != 0) {
			int np = len * f / 100;
			SongTicker.sendAction
			(
				"showinfo",
				translate("Seek") + ": " + integerToTime(np) + "/" + integerToTime(len) + " (" + integerToString(f) + "%) ",
				0, 0, 0, 0
			);
		}
	}
}

/** Hehe, this is the best trick i figured out to indicate if we have a stream */

Seeker.onSetVisible (Boolean onoff)
{
	if (onoff)
	{
		progressBar.show();
	}
	else
	{
		progressBar.hide();
	}
}

Seeker.onLeftButtonDown(int x, int y) {
	seeking = 1;
	Seeker.setAlpha(128);
	SeekerBehind.show();
}

Seeker.onLeftButtonUp(int x, int y) {
	seeking = 0;
	Seeker.setAlpha(255);
	SeekerBehind.hide();
	SongTicker.sendAction("cancelinfo", "", 0, 0, 0, 0);
}

Seeker.onSetFinalPosition(int p) {
	SongTicker.sendAction("cancelinfo", "", 0, 0, 0, 0);
}