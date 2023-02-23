//Taken straight out of Winamp Modern's display.m.
//Modified to include the Volume change, balance change,
//EQ change messages. Also hooks into the Main Window
//and Equalizer for obvious reasons.

//Now handles switching most of the main windows,
//the Equalizer does this on it's own, though the
//mechanism is the same.

#include "../../../lib/std.mi"
#include "..\..\..\lib/winampconfig.mi"
#include "IsWACUP.m"

Global Group frameGroup, frameGroupEQ, frameGroupEQShade, frameGroupPL, frameGroupShade, frameGroupVideo;
Global Togglebutton ShuffleBtn, RepeatBtn/*, CLBA*/;
Global Timer SongTickerTimer;
Global Text InfoTicker;
Global GuiObject SongTicker;
Global Slider Balance, BalanceEQ;
Global Layout Normal, ShadeEQ, NormalEQ;

Global Layer wacupmain, wacuptitlebar, wacupshade;
Global Layer wacuppl1, wacuppl2, wacuppl3, wacuppl4, wacuppl5, wacuppl6, wacuppl7, wacuppl8, wacuppl9, wacupplvis, wacupplcenter;
Global Layer wacupvideo1, wacupvideo2, wacupvideo3, wacupvideo4, wacupvideo5, wacupvideo6, wacupvideo7, wacupvideo8, wacupvideo9;

Global Slider Seeker;
Global Int Seeking;
Global Boolean manual_set;

#define ISOBANDS "31.5 Hz,63 Hz,125 Hz,250 Hz,500 Hz,1 KHz,2 KHz,4 KHz,8 KHz,16 KHz"
#define WINAMPBANDS "70 Hz,180 Hz,320 Hz,600 Hz,1 KHz,3 KHz,6 KHz,12 KHz,14 KHz,16 KHz"

System.onScriptLoaded(){

	initDetector();

    WinampConfigGroup eqwcg = WinampConfig.getGroup("{72409F84-BAF1-4448-8211-D84A30A1591A}");
	int freqmode = eqwcg.getInt("frequencies"); // returns 0 for classical winamp levels, 1 for ISO levels

	frameGroup = getContainer("Main").getLayout("Normal");
	frameGroupShade = getContainer("Main").getLayout("shade");
	wacupshade = frameGroupShade.findObject("washade");

    SongTicker = frameGroup.findObject("songticker");
	InfoTicker = frameGroup.findObject("infoticker");
    Balance = frameGroup.findObject("Balance");

	wacupmain = frameGroup.findObject("mainwnd");
	wacuptitlebar = frameGroup.findObject("wa.titlebar");

    frameGroupEQShade = getContainer("eq").getLayout("shadeeq");
    BalanceEQ = frameGroupEQShade.findObject("Balance");

    frameGroupEQ = getContainer("eq").getLayout("eq");
	frameGroupVideo = getContainer("video").getLayout("normal");

	normal = getContainer("main").getlayout("normal");
    shadeeq = getContainer("eq").getlayout("shadeeq");
    normalEQ = getContainer("eq").getlayout("eq");

	frameGroupPL = getContainer("PL").getLayout("normal");

	SongTickerTimer = new Timer;
	SongTickerTimer.setDelay(1000);

	RepeatBtn = frameGroup.findObject("Repeat");
	ShuffleBtn = frameGroup.findObject("Shuffle");
    //CLBA = frameGroup.findObject("CLB.A");

	Seeker = frameGroup.findObject("player.slider.seek");
	SongTicker = frameGroup.findObject("songticker");
	InfoTicker = frameGroup.findObject("infoticker");

	wacuppl1 = frameGroupPL.findObject("wa2.pl1");
	wacuppl2 = frameGroupPL.findObject("wa2.pl2");
	wacuppl3 = frameGroupPL.findObject("wa2.pl3");
	wacuppl4 = frameGroupPL.findObject("wa2.pl4");
	wacuppl5 = frameGroupPL.findObject("wa2.pl5");
	wacuppl6 = frameGroupPL.findObject("wa2.pl6");
	wacuppl7 = frameGroupPL.findObject("wa2.pl7");
	wacuppl8 = frameGroupPL.findObject("wa2.pl8");
	wacuppl9 = frameGroupPL.findObject("wa2.pl9");
	wacupplcenter = frameGroupPL.findObject("pl.center.logo");
	wacupplvis = frameGroupPL.findObject("pl.vis.area");

	wacupvideo1 = frameGroupVideo.findObject("video.topleft");
	wacupvideo2 = frameGroupVideo.findObject("video.stretchybit");
	wacupvideo3 = frameGroupVideo.findObject("video.center");
	wacupvideo4 = frameGroupVideo.findObject("video.topright");
	wacupvideo5 = frameGroupVideo.findObject("video.left");
	wacupvideo6 = frameGroupVideo.findObject("video.right");
	wacupvideo7 = frameGroupVideo.findObject("video.bottomleft");
	wacupvideo8 = frameGroupVideo.findObject("video.bottom.stretchybit");
	wacupvideo9 = frameGroupVideo.findObject("video.bottomright");

	if(IsWACUP != 0){
		wacupmain.setXmlParam("image", "wacup.main");
		wacuptitlebar.setXmlParam("image", "wacup.titlebar.on");
		wacuptitlebar.setXmlParam("inactiveimage", "wacup.titlebar.off");
		wacupshade.setXmlParam("image", "wacup.player.shade.enabled");
		wacupshade.setXmlParam("inactiveimage", "wacup.player.shade.disabled");
		wacuppl1.setXmlParam("image", "wacup.pl.1");
		wacuppl1.setXmlParam("inactiveimage", "wacup.pl.1.disabled");
		wacuppl2.setXmlParam("image", "wacup.pl.2");
		wacuppl2.setXmlParam("inactiveimage", "wacup.pl.2.disabled");
		wacuppl3.setXmlParam("image", "wacup.pl.3");
		wacuppl3.setXmlParam("inactiveimage", "wacup.pl.3.disabled");
		wacuppl4.setXmlParam("image", "wacup.pl.4");
		wacuppl6.setXmlParam("image", "wacup.pl.6");
		wacuppl7.setXmlParam("image", "wacup.pl.7");
		wacuppl8.setXmlParam("image", "wacup.pl.8");
		wacuppl9.setXmlParam("image", "wacup.pl.9");
		wacupplcenter.setXmlParam("image", "wacup.pl.2.center");
		wacupplcenter.setXmlParam("inactiveimage", "wacup.pl.2.center.disabled");
		wacupplvis.setXmlParam("image", "wacup.pl.8.vis");
		wacupvideo1.setXmlParam("image", "wacup.video.topleft.active");
		wacupvideo1.setXmlParam("inactiveimage", "wacup.video.topleft.inactive");
		wacupvideo2.setXmlParam("image", "wacup.video.top.stretchybit.active");
		wacupvideo2.setXmlParam("inactiveimage", "wacup.video.top.stretchybit.inactive");
		wacupvideo3.setXmlParam("image", "wacup.video.top.center.active");
		wacupvideo3.setXmlParam("inactiveimage", "wacup.video.top.center.inactive");
		wacupvideo4.setXmlParam("image", "wacup.video.topright.active");
		wacupvideo4.setXmlParam("inactiveimage", "wacup.video.topright.inactive");
		wacupvideo5.setXmlParam("image", "wacup.video.left");
		wacupvideo6.setXmlParam("image", "wacup.video.right");
		wacupvideo7.setXmlParam("image", "wacup.video.bottomleft");
		wacupvideo8.setXmlParam("image", "wacup.video.bottom.stretchybit");
		wacupvideo9.setXmlParam("image", "wacup.video.bottomright");
	}else{
		wacupmain.setXmlParam("image", "wa.main");
		wacuptitlebar.setXmlParam("image", "wa.titlebar.on");
		wacuptitlebar.setXmlParam("inactiveimage", "wa.titlebar.off");
		wacupshade.setXmlParam("image", "wa2.player.shade.enabled");
		wacupshade.setXmlParam("inactiveimage", "wa2.player.shade.disabled");
		wacuppl1.setXmlParam("image", "wa2.pl.1");
		wacuppl1.setXmlParam("inactiveimage", "wa2.pl.1.disabled");
		wacuppl2.setXmlParam("image", "wa2.pl.2");
		wacuppl2.setXmlParam("inactiveimage", "wa2.pl.2.disabled");
		wacuppl3.setXmlParam("image", "wa2.pl.3");
		wacuppl3.setXmlParam("inactiveimage", "wa2.pl.3.disabled");
		wacuppl4.setXmlParam("image", "wa2.pl.4");
		wacuppl6.setXmlParam("image", "wa2.pl.6");
		wacuppl7.setXmlParam("image", "wa2.pl.7");
		wacuppl8.setXmlParam("image", "wa2.pl.8");
		wacuppl9.setXmlParam("image", "wa2.pl.9");
		wacupplcenter.setXmlParam("image", "wa2.pl.2.center");
		wacupplcenter.setXmlParam("inactiveimage", "wa2.pl.2.center.disabled");
		wacupplvis.setXmlParam("image", "wa2.pl.8.vis");
		wacupvideo1.setXmlParam("image", "video.topleft.active");
		wacupvideo1.setXmlParam("inactiveimage", "video.topleft.inactive");
		wacupvideo2.setXmlParam("image", "video.top.stretchybit.active");
		wacupvideo2.setXmlParam("inactiveimage", "video.top.stretchybit.inactive");
		wacupvideo3.setXmlParam("image", "video.top.center.active");
		wacupvideo3.setXmlParam("inactiveimage", "video.top.center.inactive");
		wacupvideo4.setXmlParam("image", "video.topright.active");
		wacupvideo4.setXmlParam("inactiveimage", "video.topright.inactive");
		wacupvideo5.setXmlParam("image", "video.left");
		wacupvideo6.setXmlParam("image", "video.right");
		wacupvideo7.setXmlParam("image", "video.bottomleft");
		wacupvideo8.setXmlParam("image", "video.bottom.stretchybit");
		wacupvideo9.setXmlParam("image", "video.bottomright");
	}
}

Normal.onAction (String action, String param, Int x, int y, int p1, int p2, GuiObject source)
{
	if (strlower(action) == "showinfo")
	{
		SongTicker.hide();
		SongTickerTimer.start();
		InfoTicker.setText(param);
		InfoTicker.show();

	}
	else if (strlower(action) == "cancelinfo")
	{
		SongTickerTimer.onTimer();
	}
}

NormalEQ.onAction (String action, String param, Int x, int y, int p1, int p2, GuiObject source)
{
	if (strlower(action) == "showinfo")
	{
		SongTicker.hide();
		SongTickerTimer.start();
		InfoTicker.setText(param);
		InfoTicker.show();

	}
	else if (strlower(action) == "cancelinfo")
	{
		SongTickerTimer.onTimer();
	}
}

SongTickerTimer.onTimer() {
	SongTicker.show();
	InfoTicker.hide();
	SongTickerTimer.stop();
}

System.onScriptUnloading() {
	delete SongTickerTimer;
}

Balance.onSetPosition(int newpos)
{
	string t=translate("Balance")+":";
	if (newpos==127) t+= " " + translate("Center");
	if (newpos<127) t += " " + integerToString((100-(newpos/127)*100))+"% "+translate("Left");
	if (newpos>127) t += " " + integerToString(((newpos-127)/127)*100)+"% "+translate("Right");

	SongTickerTimer.start();
	SongTicker.hide();
	InfoTicker.show();
	InfoTicker.setText(t);
}

System.onvolumechanged(int newvol)
{
	SongTickerTimer.start();
	SongTicker.hide();
	InfoTicker.show();
	InfoTicker.setText(translate("Volume") + ": " + integerToString(newvol/2.55) + "%");
}

RepeatBtn.onToggle(boolean on) {
	SongTickerTimer.start();
	int v = getCurCfgVal();
	SongTicker.hide();
	InfoTicker.show();
    if (on) InfoTicker.setText("Repeat: ON"); else InfoTicker.setText("Repeat: OFF");
}

ShuffleBtn.onToggle(boolean on) {
	SongTickerTimer.start();
	SongTicker.hide();
	InfoTicker.show();
	if (on) InfoTicker.setText("Shuffle: ON"); else InfoTicker.setText("Shuffle: OFF");
}
/*
CLBA.onToggle(boolean on) {
	SongTickerTimer.start();
	SongTicker.hide();
	InfoTicker.show();
	if (on) InfoTicker.setText("Enable Always-on-Top"); else InfoTicker.setText("Disable Always-on-Top");
}*/

shadeEQ.onAction (String action, String param, Int x, int y, int p1, int p2, GuiObject source)
{
	if (strlower(action) == "showinfo")
	{
		SongTicker.hide();
		SongTickerTimer.start();
		InfoTicker.setText(param);
		InfoTicker.show();

	}
	else if (strlower(action) == "cancelinfo")
	{
		SongTickerTimer.onTimer ();
	}
}

BalanceEQ.onSetPosition(int newpos)
{
	string t=translate("Balance")+":";
	if (newpos==127) t+= " " + translate("Center");
	if (newpos<127) t += " " + integerToString((100-(newpos/127)*100))+"% "+translate("Left");
	if (newpos>127) t += " " + integerToString(((newpos-127)/127)*100)+"% "+translate("Right");

	SongTickerTimer.start();
	SongTicker.hide();
	InfoTicker.show();
	InfoTicker.setText(t);
}

SongTickerTimer.onTimer() {
	SongTicker.show();
	InfoTicker.hide();
	SongTickerTimer.stop();
}

System.onScriptUnloading() {
	delete SongTickerTimer;
}


Seeker.onSetPosition(int p) {
	if (seeking) {
        String propertime;
        String propertime2;
		Float f;
		f = p;
		f = f / 255 * 100;
		Float len = getPlayItemLength();
		if (len != 0) {
			int np = len * f / 100;
                if(np < 600000){
                    propertime = "0"+integerToTime(np);
                }
                else{
                    propertime = integerToTime(np);
                }

                if(len < 600000){
                    propertime2 = "0"+integerToTime(len);
                }
                else{
                    propertime2 = integerToTime(len);
                }

			SongTickerTimer.start();
			SongTicker.hide();
			InfoTicker.show();
			InfoTicker.setText(translate("Seek to") + ": " + propertime + "/" + propertime2 + " (" + integerToString(f) + "%)");
		}
	}
}

Seeker.onLeftButtonDown(int x, int y) {
	seeking = 1;
}

Seeker.onLeftButtonUp(int x, int y) {
	seeking = 0;
	SongTickerTimer.start();
	SongTicker.show();
	InfoTicker.hide();
}

Seeker.onSetFinalPosition(int p) {
	SongTickerTimer.start();
	SongTicker.show();
	InfoTicker.hide();
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

	normal.sendAction("showinfo", t, 0,0,0,0);
}

system.onEqPreampChanged(int value)
{
	slider s = frameGroupEQ.findObject("preamp");
	value = s.getPosition(); // Somehow this function returns a range from [-127;125] with hotpos -3, so we take the slider instead
	String t = "EQ: " + translate("Preamp:") + " ";
	Float f = value;
	f = f / 10.5;
	if (f >= -3) t += "+"+floattostring(f, 1) + " "+ translate("dB");
	else t += floattostring(f, 1) + " "+ translate("dB");
	
	normal.sendAction("showinfo", t, 0,0,0,0);
}