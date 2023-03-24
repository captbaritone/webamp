/*---------------------------------------------------
-----------------------------------------------------
Filename:	syncbutton.m
Version:	1.0

Type:		maki
Date:		25. Jun. 2007 - 14:04 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>

Function String getArtist ();

Global Button search, nowplaying;

System.onScriptLoaded ()
{
	search = getScriptGroup().getObject("search");
	nowplaying = getScriptGroup().getObject("nowplaying");
}

search.onLeftClick ()
{
	String artist = getArtist();
	if (artist == "") return;

	getContainer("main").switchToLayout("normal");
	group sui = getContainer("main").getLayout("normal").findObject("sui.content");
	sui.sendAction ("browser_search", artist, 0, 0, 0, 0);
}

nowplaying.onLeftClick ()
{
	String artist = getArtist();
	if (artist == "") return;

	//getContainer("main").switchToLayout("normal");
	System.navigateUrlBrowser("http://client.winamp.com/nowplaying/artist/?artistName=" + artist);
}

String getArtist ()
{
	String artist = getPlayItemMetaDataString("artist");
	if (artist == "") artist = getPlayItemMetaDataString("uvox/artist");
	if (artist == "") artist = getPlayItemMetaDataString("cbs/artist");
	if (artist == "") artist = getPlayItemMetaDataString("streamtitle");
	if (artist == "") artist = getPlayItemDisplayTitle();
	
	return artist;
}