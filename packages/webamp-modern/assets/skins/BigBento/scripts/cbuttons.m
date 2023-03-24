/*---------------------------------------------------
-----------------------------------------------------
Filename:	cbuttons.m
Version:	1.0

Type:		maki
Date:		03. Nov. 2006 - 17:02 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>
#include <lib/pldir.mi>

#define GLOW_OBJECT Prev
#include <lib/glow.m>
#define GLOW_OBJECT Next
#include <lib/glow.m>
#define GLOW_OBJECT Play
#include <lib/glow.m>
#define GLOW_OBJECT Pause
#include <lib/glow.m>
#define GLOW_OBJECT Stop
#include <lib/glow.m>
#define GLOW_OBJECT Eject
#include <lib/glow.m>
#define GLOW_OBJECT Repeat
#include <lib/glow.m>
#define GLOW_OBJECT Shuffle
#include <lib/glow.m>
#define GLOW_OBJECT Bolt
#include <lib/glow.m>

Class Button InfoButton;
Class ToggleButton InfoToggleButton;

Global InfoButton b_play, b_pause, b_eject, b_prev, b_next, b_stop, b_bolt;
Global InfoToggleButton b_repeat, b_shuffle;
Global GuiObject SongTicker;
Global Group buttongroup;
Global GuiObject shuffleActive, repeatActive, boltGlow;
Global Int shuffleActive_Y, repeatActive_Y, minW, boltX, grabbX;
Global Layer mainframe_grabber;
Global Timer beatvis;

System.onScriptLoaded ()
{
	buttongroup = getScriptGroup().findObject("player.cbuttons");

	b_play = buttongroup.getObject("Play");
	b_pause = buttongroup.getObject("Pause");
	b_eject = buttongroup.getObject("Eject");
	b_prev = buttongroup.getObject("Prev");
	b_next = buttongroup.getObject("Next");
	b_stop = buttongroup.getObject("Stop");
	b_repeat = buttongroup.getObject("repeat");
	b_shuffle = buttongroup.getObject("shuffle");
	b_bolt = buttongroup.getParentLayout().getObject("bolt");
	boltGlow = buttongroup.getParentLayout().getObject("bolt.glow");
	shuffleActive = getScriptGroup().findObject("shuffle.active");
	shuffleActive_Y = shuffleActive.getGuiY();
	repeatActive = getScriptGroup().findObject("repeat.active");
	repeatActive_Y = repeatActive.getGuiY();
	mainframe_grabber = buttongroup.getParentLayout().getObject("player.mainframe.grabber");

	beatvis = new Timer;
	beatvis.setDelay(33);

	minW = stringToInteger(getParam());
	boltX = b_bolt.getGuiX();
	grabbX = mainframe_grabber.getGuiX();

	b_bolt.setXmlParam("x", integerToString(boltX + buttongroup.GetWidth() - minW));
	boltGlow.setXmlParam("x", integerToString(boltX + buttongroup.GetWidth() - minW));
	mainframe_grabber.setXmlParam("x", integerToString(grabbX + buttongroup.GetWidth() - minW));

	_Play_GlowInit (b_play, buttongroup.findObject("Play.glow"), 0.3);
	_Pause_GlowInit (b_pause, buttongroup.findObject("Pause.glow"), 0.3);
	_Stop_GlowInit (b_stop, buttongroup.findObject("Stop.glow"), 0.3);
	_Prev_GlowInit (b_prev, buttongroup.findObject("Prev.glow"), 0.3);
	_Next_GlowInit (b_next, buttongroup.findObject("Next.glow"), 0.3);
	_Eject_GlowInit (b_eject, buttongroup.findObject("Eject.glow"), 0.3);
	_Repeat_GlowInit (b_repeat, buttongroup.findObject("repeat.glow"), 0.3);
	_Shuffle_GlowInit (b_shuffle, buttongroup.findObject("shuffle.glow"), 0.3);
	_Bolt_GlowInit (b_bolt, buttongroup.getParentLayout().getObject("bolt.glow"), 0.7);

	SongTicker = buttongroup.getParentLayout().findObject("songticker");
}

system.onScriptUnloading ()
{
	beatvis.stop();
	delete beatvis;
}

InfoButton.onLeftButtonDown (int x, int y)
{
	if (InfoButton == b_play)
	{
		if (getStatus() == -1)
		{
			SongTicker.sendAction("showinfo", "Resume Playback", 0, 0, 0, 0);
		}
		else if (getStatus() == 0)
		{
			SongTicker.sendAction("showinfo", "Start Playback", 0, 0, 0, 0);
		}
		else if (getStatus() == 1)
		{
			SongTicker.sendAction("showinfo", "Restart Playback", 0, 0, 0, 0);
		}
	}
	else if (InfoButton == b_pause)
	{
		if (getStatus() == -1)
		{
			SongTicker.sendAction("showinfo", "Resume Playback", 0, 0, 0, 0);
		}
		else if (getStatus() == 1)
		{
			SongTicker.sendAction("showinfo", "Pause Playback", 0, 0, 0, 0);
		}
	}
	else if (InfoButton == b_pause)
	{
		if (getStatus() == 1)
		{
			SongTicker.sendAction("showinfo", "Pause Playback", 0, 0, 0, 0);
		}
	}
	else
	{
		string info = InfoButton.getXmlParam("tooltip");
		SongTicker.sendAction("showinfo", info, 0, 0, 0, 0);		
	}
}

InfoToggleButton.onLeftButtonDown (int x, int y)
{
	if (InfoToggleButton == b_shuffle)
	{
		if (getCurCfgVal() == 1)
		{
			SongTicker.sendAction("showinfo", "Shuffle: On", 0, 0, 0, 0);
		}
		else
		{
			SongTicker.sendAction("showinfo", "Shuffle: Off", 0, 0, 0, 0);
		}
	}
	else if (InfoToggleButton == b_repeat)
	{
		if (getCurCfgVal() == 1)
		{
			SongTicker.sendAction("showinfo", "Repeat: Playlist", 0, 0, 0, 0);
		}
		else if (getCurCfgVal() == -1)
		{
			SongTicker.sendAction("showinfo", "Repeat: Track", 0, 0, 0, 0);
		}
		else if (getCurCfgVal() == 0)
		{
			SongTicker.sendAction("showinfo", "Repeat: Off", 0, 0, 0, 0);
		}
	}
}

InfoToggleButton.onLeftButtonUp (int x, int y)
{
	if (InfoToggleButton == b_shuffle)
	{
		if (getCurCfgVal() == 1)
		{
			SongTicker.sendAction("showinfo", "Shuffle: On", 0, 0, 0, 0);
		}
		else
		{
			SongTicker.sendAction("showinfo", "Shuffle: Off", 0, 0, 0, 0);
		}
	}
	else if (InfoToggleButton == b_repeat)
	{
		if (getCurCfgVal() == 1)
		{
			SongTicker.sendAction("showinfo", "Repeat: Playlist", 0, 0, 0, 0);
		}
		else if (getCurCfgVal() == -1)
		{
			SongTicker.sendAction("showinfo", "Repeat: Track", 0, 0, 0, 0);
		}
		else if (getCurCfgVal() == 0)
		{
			SongTicker.sendAction("showinfo", "Repeat: Off", 0, 0, 0, 0);
		}
	}
}

Global Boolean shuffleDown, repeatDown;
b_shuffle.onLeftButtonDown (int x, int y)
{
	shuffleDown = 1;
	shuffleActive.setXmlParam("y", integerToString(shuffleActive_Y+1));
}

b_shuffle.onLeftButtonUp (int x, int y)
{
	shuffleDown = 0;
	shuffleActive.setXmlParam("y", integerToString(shuffleActive_Y));
}

b_shuffle.onleaveArea ()
{
	shuffleActive.setXmlParam("y", integerToString(shuffleActive_Y));
}

b_shuffle.onEnterArea ()
{
	if (shuffleDown) shuffleActive.setXmlParam("y", integerToString(shuffleActive_Y+1));
}

b_repeat.onLeftButtonDown (int x, int y)
{
	repeatDown = 1;
	repeatActive.setXmlParam("y", integerToString(repeatActive_Y+1));
}

b_repeat.onLeftButtonUp (int x, int y)
{
	repeatDown = 0;
	repeatActive.setXmlParam("y", integerToString(repeatActive_Y));
}

b_repeat.onleaveArea ()
{
	repeatActive.setXmlParam("y", integerToString(repeatActive_Y));
}

b_repeat.onEnterArea ()
{
	if (repeatDown) repeatActive.setXmlParam("y", integerToString(repeatActive_Y+1));
}

buttongroup.onResize (int x, int y, int w, int h)
{
	b_bolt.setXmlParam("x", integerToString(boltX + buttongroup.GetWidth() - minW));
	boltGlow.setXmlParam("x", integerToString(boltX + buttongroup.GetWidth() - minW));
	mainframe_grabber.setXmlParam("x", integerToString(grabbX + buttongroup.GetWidth() - minW));
}

b_bolt.onLeftButtonUp (int x, int y)
{
	if (isKeyDown(VK_ALT) && isKeyDown(VK_SHIFT) && isKeyDown(VK_CONTROL))
	{
		if (beatvis.isRunning())
		{
			beatvis.stop();
		}
		else
		{
			beatvis.start();
		}
		complete;
	}
}

beatvis.onTimer ()
{
	int value = (getRightVuMeter() + getLeftVuMeter()) / 2;
	boltGlow.setAlpha(value);
}
/*
System.onKeyDown (String key)
{
	if (key == "space")
	{
		PlEdit.showCurrentlyPlayingTrack();

		complete;
	}
}*/

System.onAccelerator (String action, String section, String key)
{
	if (strupper(action) == "SHOW_CURRENT_TRACK")
	{
		PlEdit.showCurrentlyPlayingTrack();

		complete;
	}
}