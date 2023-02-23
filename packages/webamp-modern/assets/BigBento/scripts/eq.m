/*---------------------------------------------------
-----------------------------------------------------
Filename:	eq.m
Version:	2.0

Type:		maki
Date:		25. Jun. 2007 - 11:30 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>
#include <lib/winampconfig.mi>

// #define CENTER_VAR eqGroup
// #include <lib/centerlayer.m>
#include "eqgroup.m"

#define ISOBANDS "31.5 Hz,63 Hz,125 Hz,250 Hz,500 Hz,1 KHz,2 KHz,4 KHz,8 KHz,16 KHz"
#define WINAMPBANDS "70 Hz,180 Hz,320 Hz,600 Hz,1 KHz,3 KHz,6 KHz,12 KHz,14 KHz,16 KHz"

Global Group frameGroup, buttongroup;
Global Slider slidercb, Balance;
Global Text fadertext;
Global Button CFIncrease, CFDecrease, eqon, eqauto;
Global ToggleButton Crossfade;
Global GuiObject CrossfadeActive, eqonActive, eqautoActive, SongTicker;
Global Int CrossfadeActive_Y, eqonActive_Y, eqautoActive_Y;
Global Button btnEQp12,btnEQ0,btnEQm12;
Global layer frequencyLabel;

System.onScriptLoaded()
{
	buttongroup = getScriptGroup().findObject("player.cbuttons");
	WinampConfigGroup eqwcg = WinampConfig.getGroup("{72409F84-BAF1-4448-8211-D84A30A1591A}");

	int freqmode = eqwcg.getInt("frequencies"); // returns 0 for classical winamp levels, 1 for ISO levels

	frameGroup = getScriptGroup();
	_eqGroupInit(frameGroup.findObject("info.component.eq.content"), frameGroup, 1, 0);
	slidercb = frameGroup.findObject("sCrossfade");
	fadertext = frameGroup.findObject("CFDisplay");
	CFIncrease = frameGroup.findObject("CrossfadeIncrease");
	CFDecrease = frameGroup.findObject("CrossfadeDecrease");
	Crossfade = frameGroup.findObject("Crossfade");
	CrossfadeActive = frameGroup.findObject("CrossfadeActive");
	CrossfadeActive_Y = CrossfadeActive.getGuiY();

	eqon = frameGroup.findObject("eqonoff");
	eqonActive = frameGroup.findObject("eqonoffActive");
	eqonActive_Y = eqonActive.getGuiY();

	eqauto = frameGroup.findObject("eqauto");
	eqautoActive = frameGroup.findObject("eqautoActive");
	eqautoActive_Y = eqautoActive.getGuiY();

	btnEQp12 = frameGroup.findObject("EQ_p12");
	btnEQ0 = frameGroup.findObject("EQ_0");
	btnEQm12 = frameGroup.findObject("EQ_m12");

	Balance = frameGroup.findObject("Balance");
	SongTicker = buttongroup.getParentLayout().findObject("songticker");

	frequencyLabel = frameGroup.findObject("frequency.labels");

	system.onEqFreqChanged(freqmode);

	slidercb.onSetPosition(slidercb.getPosition());

	Crossfade.onToggle(Crossfade.getActivated());

	debugString("WELCOME TO EQUALIZER COY", 9);
}

Balance.onSetPosition(int newpos)
{
	string t=translate("Balance")+":";
	if (newpos==127) t+= " " + translate("Center");
	if (newpos<127) t += " " + integerToString((100-(newpos/127)*100))+"% "+translate("Left");
	if (newpos>127) t += " " + integerToString(((newpos-127)/127)*100)+"% "+translate("Right");

	SongTicker.sendAction("showinfo", t, 0, 0, 0, 0);
}

slidercb.onSetPosition(int val)
{
	String s = IntegerToString(val);
	fadertext.setText(s);
}

CFIncrease.onLeftClick()
{
	slidercb.SetPosition(slidercb.getPosition()+1);
}

CFDecrease.onLeftClick()
{
	slidercb.SetPosition(slidercb.getPosition()-1);
}

Crossfade.onToggle(boolean on)
{
	if (!on)
	{
		fadertext.setAlpha(150);
		CFIncrease.setAlpha(150);
		CFDecrease.setXmlParam("ghost" , "1");
		CFDecrease.setAlpha(150);
		CFIncrease.setXmlParam("ghost" , "1");
		CrossfadeActive.hide();
	}
	else
	{
		fadertext.setAlpha(255);
		CFIncrease.setAlpha(255);
		CFDecrease.setAlpha(255);
		CFIncrease.setXmlParam("ghost" , "0");
		CFDecrease.setXmlParam("ghost" , "0");
		CrossfadeActive.show();
	}
}

Global Boolean cfDown, onDown, autoDown, manual_set;
Crossfade.onLeftButtonDown (int x, int y)
{
	cfDown = 1;
	CrossfadeActive.setXmlParam("y", integerToString(CrossfadeActive_Y+1));
}

Crossfade.onLeftButtonUp (int x, int y)
{
	cfDown = 0;
	CrossfadeActive.setXmlParam("y", integerToString(CrossfadeActive_Y));
}

Crossfade.onleaveArea ()
{
	CrossfadeActive.setXmlParam("y", integerToString(CrossfadeActive_Y));
}

Crossfade.onEnterArea ()
{
	if (cfDown) CrossfadeActive.setXmlParam("y", integerToString(CrossfadeActive_Y+1));
}

eqon.onEnterArea ()
{
	if (onDown) eqonActive.setXmlParam("y", integerToString(eqonActive_Y+1));
}

eqon.onLeftButtonDown (int x, int y)
{
	onDown = 1;
	eqonActive.setXmlParam("y", integerToString(eqonActive_Y+1));
}

eqon.onLeftButtonUp (int x, int y)
{
	onDown = 0;
	eqonActive.setXmlParam("y", integerToString(eqonActive_Y));
}

eqon.onleaveArea ()
{
	eqonActive.setXmlParam("y", integerToString(eqonActive_Y));
}

eqauto.onLeftButtonDown (int x, int y)
{
	autoDown = 1;
	eqautoActive.setXmlParam("y", integerToString(eqautoActive_Y+1));
}

eqauto.onLeftButtonUp (int x, int y)
{
	autoDown = 0;
	eqautoActive.setXmlParam("y", integerToString(eqautoActive_Y));
}

eqauto.onleaveArea ()
{
	eqautoActive.setXmlParam("y", integerToString(eqautoActive_Y));
}

eqauto.onEnterArea ()
{
	if (autoDown) eqautoActive.setXmlParam("y", integerToString(eqautoActive_Y+1));
}


btnEQp12.onLeftClick()
{
	manual_set = 1;
	for(int i=0; i<10; i++) setEqBand(i, 127);
	manual_set = 0;
}

btnEQ0.onLeftClick()
{
	manual_set = 1;
	for(int i=0; i<10; i++) setEqBand(i, 0);
	manual_set = 0;
}

btnEQm12.onLeftClick()
{
	manual_set = 1;
	for(int i=0; i<10; i++) setEqBand(i, -127);
	manual_set = 0;
}

System.onEqFreqChanged (boolean isoonoff)
{
	if (isoonoff == 1)
	{
		frequencyLabel.setXmlParam("image", "equalizer.labels.iso");
		for(int i=0; i<10; i++) frameGroup.findObject("eq"+integerToString(i+1)).setXmlParam("tooltip", getToken(ISOBANDS,",",i));
	}
	else
	{
		frequencyLabel.setXmlParam("image", "equalizer.labels.winamp");
		for(int i=0; i<10; i++) frameGroup.findObject("eq"+integerToString(i+1)).setXmlParam("tooltip", getToken(WINAMPBANDS,",",i));
	}
}

system.onEqBandChanged(int band, int value)
{
	if (manual_set) return;
	String t;
	Float f = value;
	f = f / 10.5;
	WinampConfigGroup eqwcg = WinampConfig.getGroup("{72409F84-BAF1-4448-8211-D84A30A1591A}");
	if (eqwcg.getInt("frequencies") == 1) {
		if (f >= 0) t = "EQ: " + translate(getToken(ISOBANDS,",",band)) + ": +" + floattostring(f, 1) + " "+ translate("dB");
		else t = "EQ: " + translate(getToken(ISOBANDS,",",band)) + ": " + floattostring(f, 1) + " "+ translate("dB");
	}
	else {
		if (f >= 0) t = "EQ: " + translate(getToken(WINAMPBANDS,",",band)) + ": +" + floattostring(f, 1) + " "+ translate("dB");
		else t = "EQ: " + translate(getToken(WINAMPBANDS,",",band)) + ": " + floattostring(f, 1) + " "+ translate("dB");
	}

	SongTicker.sendAction("showinfo", t, 0, 0, 0, 0);
}

system.onEqPreampChanged(int value)
{
	slider s = getScriptGroup().findObject("preamp");
	value = s.getPosition(); // Somehow this function returns a range from [-127;125] with hotpos -3, so we take the slider instead
	String t = "EQ: " + translate("Preamp:") + " ";
	Float f = value;
	f = f / 10.5;
	if (f >= 0) t += "+"+floattostring(f, 1) + " "+ translate("dB");
	else t += floattostring(f, 1) + " "+ translate("dB");
	SongTicker.sendAction("showinfo", t, 0, 0, 0, 0);
}