//Taken straight out of Winamp Modern's display.m.
//Modified to include the Volume change messages.

#include "../../../lib/std.mi"
#include "..\..\..\lib/winampconfig.mi"

Global Group frameGroup, frameGroupEQ, frameGroupEQShade;
Global Togglebutton ShuffleBtn, RepeatBtn/*, CLBA*/;
Global Timer SongTickerTimer;
Global Text InfoTicker;
Global GuiObject SongTicker;
Global Slider Balance, BalanceEQ;
Global Layout Normal, ShadeEQ, NormalEQ;

Global Slider Seeker;
Global Int Seeking;
Global Boolean manual_set;

#define ISOBANDS "31.5 Hz,63 Hz,125 Hz,250 Hz,500 Hz,1 KHz,2 KHz,4 KHz,8 KHz,16 KHz"
#define WINAMPBANDS "70 Hz,180 Hz,320 Hz,600 Hz,1 KHz,3 KHz,6 KHz,12 KHz,14 KHz,16 KHz"

System.onScriptLoaded() {

    WinampConfigGroup eqwcg = WinampConfig.getGroup("{72409F84-BAF1-4448-8211-D84A30A1591A}");
	int freqmode = eqwcg.getInt("frequencies"); // returns 0 for classical winamp levels, 1 for ISO levels

	frameGroup = getContainer("Main").getLayout("Normal");
    SongTicker = frameGroup.findObject("songticker");
	InfoTicker = frameGroup.findObject("infoticker");
    Balance = frameGroup.findObject("Balance");


    frameGroupEQShade = getContainer("eq").getLayout("shadeeq");
    BalanceEQ = frameGroupEQShade.findObject("Balance");

    frameGroupEQ = getContainer("eq").getLayout("eq");

	normal = getContainer("main").getlayout("normal");
    shadeeq = getContainer("eq").getlayout("shadeeq");
    normalEQ = getContainer("eq").getlayout("eq");

	SongTickerTimer = new Timer;
	SongTickerTimer.setDelay(1000);

	RepeatBtn = frameGroup.findObject("Repeat");
	ShuffleBtn = frameGroup.findObject("Shuffle");
    //CLBA = frameGroup.findObject("CLB.A");

	Seeker = frameGroup.findObject("player.slider.seek");
	SongTicker = frameGroup.findObject("songticker");
	InfoTicker = frameGroup.findObject("infoticker");
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