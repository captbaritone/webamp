#include <lib/std.mi>
#include "attribs.m"

Global Group frameGroup;
Global Togglebutton ShuffleBtn,RepeatBtn;
Global Timer SongTickerTimer;
Global Text InfoTicker;
Global GuiObject SongTicker;
Global Slider Balance;
Global Layout normal;

function setSongtickerScrolling();

System.onScriptLoaded() {
	initAttribs();
	frameGroup = getScriptGroup();
	SongTicker = frameGroup.findObject("songticker");
	InfoTicker = frameGroup.findObject("infoticker");
	normal = frameGroup.getParentLayout();

	SongTickerTimer = new Timer;
	SongTickerTimer.setDelay(1000);

	RepeatBtn = frameGroup.findObject("Repeat");
	ShuffleBtn = frameGroup.findObject("Shuffle");

	Balance = frameGroup.findObject("Balance");
	setSongtickerScrolling();
}

normal.onAction (String action, String param, Int x, int y, int p1, int p2, GuiObject source)
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
	if (v == 0) InfoTicker.setText("Repeat: OFF");
	else if (v > 0) InfoTicker.setText("Repeat: ALL");
	else if (v < 0) InfoTicker.setText("Repeat: TRACK");
}

ShuffleBtn.onToggle(boolean on) {
	SongTickerTimer.start();
	SongTicker.hide();
	InfoTicker.show();
	if (on) InfoTicker.setText("Playlist Shuffling: ON"); else InfoTicker.setText("Playlist Shuffling: OFF");
}


songticker_scrolling_attrib.onDataChanged() {
	setSongtickerScrolling();
}

setSongtickerScrolling() {
	if (songticker_scrolling_modern_attrib.getData()=="1") {
		SongTicker.setXMLParam("ticker","bounce");
	}
	else if (songticker_scrolling_classic_attrib.getData()=="1") {
		SongTicker.setXMLParam("ticker","scroll");
	}
	else {
		SongTicker.setXMLParam("ticker","off");
	}
}