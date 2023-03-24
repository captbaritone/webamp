/*---------------------------------------------------
-----------------------------------------------------
Filename:	beatvisualization.m
Version:	1.0

Type:		maki
Date:		24. Sep. 2007 - 21:11 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu

		Based on Winamp Modern
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>
#include attribs/init_appearance.m

Function updateObj(int w);

#define CENTER_VAR CONTENTGRP
Global Group contentGroup;
#include <lib/centerlayer.m>
#undef CENTER_VAR

Global Group scriptGroup;
Global animatedLayer beatVisL, beatVisR;
Global int lastBeatLeft, lastBeatRight;
Global Timer refreshVis;
Global Int totalFrames;
Global GuiObject SongTicker;

System.onScriptLoaded ()
{
	initAttribs_Appearance();

	scriptGroup = getScriptGroup();

	contentGroup = scriptGroup.getObject("player.display.beatvis.content");

	beatVisL = contentGroup.getObject("beatvisleft");
	beatVisR = contentGroup.getObject("beatvisright");

	_CONTENTGRPInit(contentGroup, scriptGroup, 1, 0);

	SongTicker = contentGroup.getParent().findObject("Songticker");

	totalFrames = beatVisR.getLength() - 1;

	lastBeatLeft = 0;
	lastBeatRight = 0;

	refreshVis = new Timer;
	refreshVis.setDelay(10);

	updateObj(scriptGroup.getWidth());
	vis_reflection_attrib.onDataChanged();
}

System.onScriptUnloading ()
{
	refreshVis.stop();
	delete refreshVis;
}

scriptGroup.onResize (int x, int y, int w, int h)
{
	updateObj(w);
}

updateObj (int w)
{
	if (w > 98)
	{
		if (scriptGroup.isVisible()) return;
		scriptGroup.show();
		if (beatvis_attrib.getData() == "1") refreshVis.start();
		//SongTicker.sendAction("setGuiX", "", 191,0,0,0);

	}
	else
	{
		refreshVis.stop();
		scriptGroup.hide();
		//SongTicker.sendAction("restoreGuiX", "", 0,0,0,0);
	}
}

refreshVis.onTimer ()
{
	if (beatvis_attrib.getData() == "0")
	{
		lastBeatLeft--;
		if (lastBeatLeft<0) lastBeatLeft=0;
		lastBeatRight--;
		if (lastBeatRight<0) lastBeatRight=0;
		
		beatVisL.gotoframe(lastBeatLeft);
		beatVisR.gotoframe(lastBeatRight);

		if (lastBeatLeft + lastBeatRight == 0)
		{
			refreshVis.stop();
		}
		return;		
	}
	
	int beatLeft= System.getLeftVuMeter();
	int beatRight= System.getRightVuMeter();

	int frameLeft=beatLeft/(totalFrames+7);
	int frameRight=beatRight/(totalFrames+7);

	if (frameLeft>totalFrames) frameLeft=totalFrames;
	if (frameRight>totalFrames) frameRight=totalFrames;

	if (frameLeft<lastBeatLeft)
	{
		frameLeft=lastBeatLeft-1;
		if (frameLeft<0) frameLeft=0;
	}

	if (frameRight<lastBeatRight)
	{
		frameRight=lastBeatRight-1;
		if (frameRight<0) frameRight=0;
	}

	lastBeatLeft=frameLeft;
	lastBeatRight=frameRight;

	beatVisL.gotoframe(frameLeft);
	beatVisR.gotoframe(frameRight);
}

beatvis_attrib.onDataChanged ()
{
	if (getData() == "1" )
	{
		if (scriptGroup.isVisible())
		{
			refreshVis.start();
		}
	}
}

vis_reflection_attrib.onDataChanged ()
{
	if (getdata() == "1")
	{
		beatVisR.setXmlParam("image", "player.beatvis.right");
		beatVisL.setXmlParam("image", "player.beatvis.left");
	}
	else
	{
		beatVisR.setXmlParam("image", "player.beatvis.right.wo");
		beatVisL.setXmlParam("image", "player.beatvis.left.wo");
	}
}