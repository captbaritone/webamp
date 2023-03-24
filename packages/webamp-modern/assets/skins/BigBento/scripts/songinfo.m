/*---------------------------------------------------
-----------------------------------------------------
Filename:	songinfo.m
Version:	1.0

Type:		maki
Date:		20. Nov. 2006 - 22:47 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>

Function int getChannels (); // returning 1 for mono, 2 for stereo, more for multichannel (e.g. 6), -1 for no info available
Function string getBitrate();
Function string getFrequency();

Global layer monster;
Global timer delayload, songInfoTimer;

Global Text Bitrate, Frequency;
Global Layer l_Bitrate, l_Frequency;
Global int tempwidth;
Global boolean param;

System.onScriptLoaded()
{
	group PlayerDisplay = getScriptgroup();

	param = (getParam() == "big");

	monster = PlayerDisplay.findObject("monster");

	Bitrate = PlayerDisplay.findObject("Bitrate");
	Frequency = PlayerDisplay.findObject("Frequency");
	l_Bitrate = PlayerDisplay.findObject("Bitrate.label");
	l_Frequency = PlayerDisplay.findObject("Frequency.label");

	delayload = new Timer;
	delayload.setDelay(100);

	songInfoTimer = new Timer;
	songInfoTimer.setDelay(1000);

	Int PlayerStatus = System.getStatus();

	if ( PlayerStatus != 0 )
	{
		delayload.start();
		bitrate.setText(getBitrate());
		Frequency.setText(getFrequency());
		if (PlayerStatus == 1)
		{
			songInfoTimer.start();
		}
	}
}

system.onScriptUnloading ()
{
	songinfotimer.stop();
	delete songinfotimer;
	delayload.stop();
	delete delayload;
}

System.onResume()
{
	delayload.start();
	songInfoTimer.start();
}

System.onPlay()
{
	delayload.start();
	songInfoTimer.start();
}

System.onStop ()
{
	monster.setXmlParam("image", "player.songinfo.na");
	songInfoTimer.stop();
}

system.onPause ()
{
	songInfoTimer.stop();
}

System.onTitleChange(String newtitle)
{
	delayload.start();
	bitrate.setText(getBitrate());
}

delayload.onTimer ()
{
	delayload.stop();
	int c = getChannels();
	if (c == -1) monster.setXmlParam("image", "player.songinfo.na");
	else if (c == 1) monster.setXmlParam("image", "player.songinfo.mono");
	else if (c == 2 || c == 3) monster.setXmlParam("image", "player.songinfo.stereo");
	else
	{
		if (tempwidth > 23) monster.setXmlParam("image", "player.songinfo.multi2");
		else monster.setXmlParam("image", "player.songinfo.multi");
	}
	//ensure to display bitrate & frequency
	bitrate.setText(getBitrate());
	Frequency.setText(getFrequency());
}

Int getChannels ()
{
	if (strsearch(getSongInfoText(), "tereo") != -1)
	{
		return 2;
	}
	else if (strsearch(getSongInfoText(), "ono") != -1)
	{
		return 1;
	}
	else if (strsearch(getSongInfoText(), "annels") != -1)
	{
		int pos = strsearch(getSongInfoText(), "annels");
		return stringToInteger(strmid(getSongInfoText(), pos - 4, 1));
	}
	else
	{
		return -1;
	}
}

songInfoTimer.onTimer ()
{
	bitrate.setText(getBitrate());
}

string getBitrate ()
{
	string sit = strlower(getSongInfoText());
	if (sit != "")
	{
		string rtn;
		int searchresult;
		for (int i = 0; i < 5; i++) {
			rtn = getToken(sit, " ", i);
			searchResult = strsearch(rtn, "kbps");
			if (searchResult>0) return StrMid(rtn, 0, searchResult);
		}
		return "";
	}
	else
	{
		return "";
	}
}

string getFrequency ()
{
	string sit = strlower(getSongInfoText());
	if (sit != "")
	{
		string rtn;
		int searchresult;
		for (int i = 0; i < 5; i++) {
			rtn = getToken(sit, " ", i);
			searchResult = strsearch(strlower(rtn), "khz");
			if (searchResult>0) 
			{
				rtn = StrMid(rtn, 0, searchResult);
				searchResult = strsearch(strlower(rtn), ".");
				if (searchResult>0)
				{
					rtn = getToken(rtn, ".", 0);
				}
				return rtn;
			}
		}
		return "";
	}
	else
	{
		return "";
	}
}

Bitrate.onTextChanged (String newtxt)
{
	if (param) return;
	if (Bitrate.getTextWidth() == tempwidth) return;
	tempwidth = getTextWidth();
	if (getTextWidth() >  23)
	{
		monster.setXmlParam("x", "-39");
		Frequency.setXmlParam("x", "-75");
		l_Bitrate.setXmlParam("x", "-91");
		l_Frequency.setXmlParam("x", "-58");		
		Bitrate.setXmlParam("w", "26");
		if (getChannels() > 3) monster.setXmlParam("image", "player.songinfo.multi2");
	}
	else
	{
		monster.setXmlParam("x", "-45");
		Frequency.setXmlParam("x", "-80");
		l_Bitrate.setXmlParam("x", "-96");
		l_Frequency.setXmlParam("x", "-63");
		Bitrate.setXmlParam("w", "20");
		if (getChannels() > 3) monster.setXmlParam("image", "player.songinfo.multi");
	}
}