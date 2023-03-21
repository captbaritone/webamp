/*---------------------------------------------------
-----------------------------------------------------
Filename:	mute.m
Version:	1.1

Type:		maki
Date:		13. Jun. 2007 - 12:39 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu

Note:		This script is based on mute.m
		from Winamp Modern
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>

#define GLOW_OBJECT MuteButton
#include <lib/glow.m>

Class Button GlowButton;

Global int VOLUME_FILL_MAX_W;

Global Group frameGroup;
Global Button MuteBtn, DeMuteBtn;
Global GuiObject SongTicker;
Global Float VolumeLevel;
Global Boolean Muted,BtnPressed;
Global GuiObject fill;
Global GuiObject muteActive;
Global Int muteActive_Y;
Global Boolean demuteDown;
Global Boolean isShade;

System.onScriptLoaded()
{
	frameGroup = system.getScriptGroup();
	isShade = (frameGroup.getParentlayout().getID() == "shade");

	MuteBtn = frameGroup.findObject("mute");
	DeMuteBtn = frameGroup.findObject("etum");
	fill = frameGroup.findObject("player.volume.fill");
	muteActive = frameGroup.findObject("mute.active");
	SongTicker = frameGroup.findObject("songticker");

	if (!isShade) muteActive_Y = muteActive.getGuiY();

	if (!isShade) _MuteButton_GlowInit (MuteBtn, frameGroup.findObject("mute.glow"), 0.3);
	if (!isShade) _MuteButton_addTrigger (DeMuteBtn);

	Muted = getPrivateInt("winamp5", "muted", 0);
	VolumeLevel = getPrivateInt("winamp5", "old_volume", 0);

	VOLUME_FILL_MAX_W = stringToInteger(getParam());

	fill.setXmlParam("w", integerToString(VOLUME_FILL_MAX_W*getVolume()/255));

	if (Muted)
	{
		SongTicker.sendAction("showinfo", "Mute ON", 0, 0, 0, 0);
		MuteBtn.hide();
		DeMuteBtn.show();
		if (!isShade) muteActive.show();
	}
	else
	{
		MuteBtn.show();
		DeMuteBtn.hide();
		if (!isShade) muteActive.hide();
	}

	BtnPressed = 0;
}


System.onScriptUnloading()
{
	setPrivateInt("winamp5", "muted", Muted);
	setPrivateInt("winamp5", "old_volume", VolumeLevel);
}

MuteBtn.onLeftClick()
{
	BtnPressed = 1;

	VolumeLevel = System.getVolume();
	System.setVolume(0);
	Muted = 1;
	DeMuteBtn.show();
	MuteBtn.hide();
	if (!isShade) muteActive.show();
}

MuteBtn.onLeftButtonDown (int x, int y)
{
	SongTicker.sendAction("showinfo", "Mute: Off", 0, 0, 0, 0);
}

DeMuteBtn.onLeftButtonDown (int x, int y)
{
	SongTicker.sendAction("showinfo", "Mute: On", 0, 0, 0, 0);
	if (!isShade) demuteDown = 1;
	if (!isShade) muteActive.setXmlParam("y", integerToString(muteActive_Y+1));
}

MuteBtn.onLeftButtonUp (int x, int y)
{
	if (Muted) SongTicker.sendAction("showinfo", "Mute: On", 0, 0, 0, 0);
}

DeMuteBtn.onLeftButtonUp (int x, int y)
{
	if (!Muted) SongTicker.sendAction("showinfo", "Mute: Off", 0, 0, 0, 0);
	if (!isShade) demuteDown = 0;
	if (!isShade) muteActive.setXmlParam("y", integerToString(muteActive_Y));
}

DeMuteBtn.onLeftClick()
{
	BtnPressed = 1;

	System.setVolume(VolumeLevel);
	Muted = 0;
	DeMuteBtn.hide();
	MuteBtn.show();
	if (!isShade) muteActive.hide();
}

DeMuteBtn.onleaveArea ()
{
	if (!isShade) muteActive.setXmlParam("y", integerToString(muteActive_Y));
}

DeMuteBtn.onEnterArea ()
{
	if (!isShade && demuteDown) muteActive.setXmlParam("y", integerToString(muteActive_Y+1));
}

System.onvolumechanged(int newvol)
{
	fill.setXmlParam("w", integerToString(VOLUME_FILL_MAX_W*getVolume()/255));
	if (!BtnPressed)
	{
		SongTicker.sendAction
		(
			"showinfo",
			translate("Volume") + ": " + integerToString(newvol/2.55) + "%",
			0, 0, 0, 0
		);
		if (Muted)
		{
			Muted = 0;
			MuteBtn.show();
			DeMuteBtn.hide();
			if (!isShade) muteActive.hide();
		}
	}
	BtnPressed = 0;
}