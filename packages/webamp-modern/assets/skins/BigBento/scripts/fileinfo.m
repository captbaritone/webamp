/*---------------------------------------------------
-----------------------------------------------------
Filename:	fileinfo.m
Version:	3.2
Type:		maki
Date:		10. Aug. 2007 - 20:42 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>
#include attribs/init_windowpage.m

// #define DEBUG
#define FILE_NAME "fileinfo.m"
#include <lib/debug.m>

#define WEBCOVER_SHOUTCAST "winamp.cover.shoutcast"
#define WEBCOVER_AOLRADIO "winamp.cover.aolradio"

Function loadFileInfo();
Class GuiObject LinkObject;
Class GuiObject CycleObject;
Function refreshRating(int rating);
Class Button RatingButton;
Function showBranding();
Class Group Infoline;

Global Group scriptGroup, g_cover;
Global Layer l_webcover;
Global AlbumArtLayer l_albumart;
Global InfoLine g_rating, g_title, g_album, g_artist, g_year, g_genre, g_track, g_publisher, g_sname, g_surl, g_albumartist, g_composer, g_format, g_disc;
Global InfoLine g_target;
Global Text t_title, t_album, t_artist, t_year, t_genre, t_track, t_publisher, t_sname, t_surl, t_composer, t_albumartist, t_format, t_disc, t_rating;
Global Timer cycler;
Global String stationLink;

Global List cycle;
Global Boolean cycler_paused, quick_change;
Global List ratingStars;

// #define CENTER_VAR Branding
Global layer l_branding;
#include "fileinfobranding.m"
// #include <lib/centerlayer.m>
// #undef CENTER_VAR

Global LinkObject linkArtist, linkAlbum, linkTitle, linkGenre, linkPublisher, linkSURl, linkSname;
Global CycleObject cycleGenre, cyclePublisher, cycleTrack, cycleYear, cycleComposer, cycleAlbumartist, cycleFormat, cycleDisc;

Global RatingButton rate1, rate2, rate3, rate4, rate5, rate0;
Global Layer star1, star2, star3, star4, star5;

Global Int startwith = 0;

Global Int maxlines;

Global timer delayLoad;

System.onScriptLoaded()
{
	initAttribs_windowpage();

	scriptGroup = getScriptGroup();

	cycler = new Timer;
	cycler.setDelay(4000);

	delayLoad = new Timer;
	delayLoad.setDelay(10);

	maxlines = stringToInteger(getParam());

	//debug(getWinampVersion() + "#" + integerToString(getBuildNumber()));

	g_rating = scriptGroup.findObject("infodisplay.line.rating");
	g_title = scriptGroup.findObject("infodisplay.line.title");
	g_album = scriptGroup.findObject("infodisplay.line.album");
	g_artist = scriptGroup.findObject("infodisplay.line.artist");
	g_year = scriptGroup.findObject("infodisplay.line.year");
	g_genre = scriptGroup.findObject("infodisplay.line.genre");
	g_track = scriptGroup.findObject("infodisplay.line.track");
	g_publisher = scriptGroup.findObject("infodisplay.line.publisher");
	g_sname = scriptGroup.findObject("infodisplay.line.sname");
	g_surl = scriptGroup.findObject("infodisplay.line.surl");
	g_composer = scriptGroup.findObject("infodisplay.line.composer");
	g_albumartist = scriptGroup.findObject("infodisplay.line.albumartist");
	g_format = scriptGroup.findObject("infodisplay.line.format");
	g_disc = scriptGroup.findObject("infodisplay.line.disc");

	t_title = g_title.findObject("text");
	t_album = g_album.findObject("text");
	t_artist = g_artist.findObject("text");
	t_year = g_year.findObject("text");
	t_genre = g_genre.findObject("text");
	t_track = g_track.findObject("text");
	t_Publisher = g_publisher.findObject("text");
	t_sname = g_sname.findObject("text");
	t_surl = g_surl.findObject("text");
	t_albumartist = g_albumartist.findObject("text");
	t_composer = g_composer.findObject("text");
	t_format = g_format.findObject("text");
	t_disc = g_disc.findObject("text");

	linkArtist = g_artist.findObject("link");
	linkAlbum = g_album.findObject("link");
	linkTitle = g_title.findObject("link");
	linksUrl = g_surl.findObject("link");
	linkSname = g_sname.findObject("link");
	cycleGenre = g_genre.findObject("link");
	cyclePublisher = g_publisher.findObject("link");
	cycleTrack = g_track.findObject("link");
	cycleYear = g_year.findObject("link");
	cycleAlbumartist = g_albumartist.findObject("link");
	cycleComposer = g_composer.findObject("link");
	cycleFormat = g_format.findObject("link");
	cycleDisc = g_disc.findObject("link");

	cycle = new List;
	ratingStars = new List;

	group parent = scriptGroup.getParent();
	l_branding = parent.findObject("branding");
	g_cover = parent.findObject("info.component.cover");
	_BrandingInit(l_branding, parent, 1, 0);

	l_albumart = g_cover.getObjecT("winamp.albumart");
	l_webcover = g_cover.getObjecT("winamp.webalbumart");

	rate1 = g_rating.findObject("rate.1");
	rate2 = g_rating.findObject("rate.2");
	rate3 = g_rating.findObject("rate.3");
	rate4 = g_rating.findObject("rate.4");
	rate5 = g_rating.findObject("rate.5");
	rate0 = g_rating.findObject("rate.0");
	ratingStars.addItem(rate1);
	ratingStars.addItem(rate2);
	ratingStars.addItem(rate3);
	ratingStars.addItem(rate4);
	ratingStars.addItem(rate5);

	star1 = g_rating.findObject("star.1");
	star2 = g_rating.findObject("star.2");
	star3 = g_rating.findObject("star.3");
	star4 = g_rating.findObject("star.4");
	star5 = g_rating.findObject("star.5");

	t_rating = g_rating.findObject("label");
	t_rating.onTextChanged ("");

	refreshRating(System.getCurrentTrackRating());
	loadFileInfo();
	if (ic_fileinfo.getData() == "1")
	{
		if (getStatus() == STATUS_STOPPED) showBranding(); // show branding if playback is stopped
		if (removePath(getPlayItemString()) == "demo.mp3") // Show branding if playing DJ Mike
		{
			if (getPlayitemmetadatastring("artist") == "DJ Mike Llama" && getplayitemmetadatastring("title") == "Llama Whippin' Intro")
			{
				showBranding();
			}
		}
	}
}

System.onScriptUnloading ()
{
	cycler.stop();
	delete cycler;

	delayLoad.stop();
	delete delayLoad;
}

// Reload fileInfo if track has changed

delayLoad.onTimer()
{
	System.onTitleChange (getPlayItemString());

	delayLoad.stop();
}

System.onTitleChange (String newtitle)
{
	// Get rid of "" calls
	if (newtitle == "" && getplayitemmetadatastring("title") == "" && !delayLoad.isRunning())
	{
		delayLoad.start();
	}
	
	// Get rid of buffering during stream connection & playback
	if (StrLeft(newtitle, 1) == "[") {
		if (	StrLeft(newtitle, 7) == "[Buffer"
			||
			StrLeft(newtitle, 4) == "[ICY") return;
	}
	// Show branding for DJ Mike
	if (removePath(getPlayItemString()) == "demo.mp3")
	{
		if (getPlayitemmetadatastring("artist") == "DJ Mike Llama" && getplayitemmetadatastring("title") == "Llama Whippin' Intro")
		{
			showBranding();
			return;
		}
		
	}

	debugString(DEBUG_PREFIX "System.onTitleChange() -> loadFileInfo();", D_WTF);
	refreshRating(System.getCurrentTrackRating());
	loadFileInfo();
}

// Reload fileInfo if textline attribs have changed

InfoLineAttribute.onDataChanged ()
{
	if (l_branding.isVisible()) return;
	loadFileInfo ();
}

//----------------------------------------------------------------------------------------------------------------
// Our main machine.
//----------------------------------------------------------------------------------------------------------------

loadFileInfo ()
{
	debugString(DEBUG_PREFIX "loadFileInfo() {", D_WTF);
	debugString(DEBUG_PREFIX "  System.getPlayItemString(): " + System.getPlayItemString(), D_WTF);
	debugString(DEBUG_PREFIX "  System.getPlayItemDisplayTitle(): " + System.getPlayItemDisplayTitle(), D_WTF);

	// cancel g_target
	if (g_target) g_target.cancelTarget();
	if (g_target) g_target.setAlpha(255);
	g_target = NULL;

	// hide all lines and cycle buttons
	g_rating.hide();
	g_title.hide();
	g_album.hide();
	g_artist.hide();
	g_year.hide();
	g_genre.hide();
	l_branding.hide();
	g_track.hide();
	g_publisher.hide();
	g_cover.setAlpha(255);
	g_surl.hide();
	g_sname.hide();
	g_albumartist.hide();
	g_composer.hide();
	g_format.hide();
	g_disc.hide();
	cycleTrack.hide();
	cycleGenre.hide();
	cyclePublisher.hide();
	cycleFormat.hide();
	cycleYear.hide();
	cycleDisc.hide();
	cycler.stop();
	cycler_paused = 0;
	stationLink = "";

	Boolean _cycle = (infocomp_cycle.getData() == "1");
	Boolean _rating = (infocomp_show_rating.getData() == "1");

	// empty cycle list
	cycle.removeAll();

	int pos = 1;

	if (maxlines > 5)
	{
		pos += 2;
	}
	
	int n = 0; 
	
	// ---------- Stream info ----------
	string stype = getPlayItemMetaDataString("streamtype"); //"streamtype" will return "2" for SHOUTcast and "3" for AOL Radio
	// map CBS/StreamTheWorld to AOL Radio
	boolean isAolRadio = (stype == "3" || stype == "4");
	boolean isCbsRadion = (stype == "4");
/*	isAolRadio = (isAolRadio||(strsearch(getPlayItemString(), "208.80.52.") >= 0));
	isAolRadio = (isAolRadio||(strsearch(getPlayItemString(), "208.80.53.") >= 0));
	isAolRadio = (isAolRadio||(strsearch(getPlayItemString(), "208.80.54.") >= 0));
	isAolRadio = (isAolRadio||(strsearch(getPlayItemString(), "208.80.55.") >= 0));*/
	debugString(DEBUG_PREFIX "  System.getPlayItemMetaDataString(streamname): " + s, D_WTF);
	if (stype == "2" || isAolRadio)
	{
		string s = getPlayItemMetaDataString("streamname");
		string metaPrefix = "uvox";
		if (isCbsRadion) metaPrefix = "cbs";
		debugString(DEBUG_PREFIX "  -> A stream is detected!", D_WTF);
 
		if (isAolRadio) { //AOL Radio always starts with uvox://
			debugString(DEBUG_PREFIX "  -> AOL Radio (uvox://)", D_WTF);
			l_albumart.hide();
			l_webcover.setXMLParam("image", WEBCOVER_AOLRADIO);
			l_webcover.show();
		}
		else
		{
			debugString(DEBUG_PREFIX "  -> SHOUTcast !(uvox://)", D_WTF);
			l_albumart.hide();
			l_webcover.setXMLParam("image", WEBCOVER_SHOUTCAST);
			l_webcover.show();
		}

		//s = "AOL Radio - Metal";
		string ss = s;

		string sa = getPlayItemMetaDataString(metaPrefix + "/artist");
		//sa = "SonaTa ArczticA";
		debugString(DEBUG_PREFIX "  System.getPlayItemMetaDataString(streamtrackartist): " + sa, D_WTF);
		

		s = getPlayItemMetaDataString(metaPrefix + "/title");
		//s = "The Harvest";
		debugString(DEBUG_PREFIX "  System.getPlayItemMetaDataString(streamtracktitle): " + s, D_WTF);
		if (s != "")
		{
			// Title
			if (n > 0) pos += 15;
			t_title.setText(s);
			g_title.setXmlParam("y", integerToString(pos));
			g_title.show();
			n++;
			cycle.addItem(g_title);

			// Artist 
			if (sa != "")
			{
				if (n > 0) pos += 15;
				t_artist.setText(sa);
				g_artist.setXmlParam("y", integerToString(pos));
				g_artist.show();
				n++;
				cycle.addItem(g_artist);				
			}
		}
		else
		{
			s = getPlayItemMetaDataString("streamtitle");
			//s = "Sonata Arctica - Full moon"; 
			debugString(DEBUG_PREFIX "  System.getPlayItemMetaDataString(streamtitle): " + s, D_WTF);
			if (s != "")
			{
				int v = strsearch(s, " - ");
				if (v > 0) {
					string s1 = strleft (s, v);
					string s2 = strright (s, strlen(s) - 3 - v);
	 
					// Title
					if (n > 0) pos += 15;
					t_title.setText(s2);
					g_title.setXmlParam("y", integerToString(pos));
					g_title.show();
					n++;
					cycle.addItem(g_title);
		  
					// Artist 
					if (n > 0) pos += 15;
					if (sa == "") t_artist.setText(s1);
					else t_artist.setText(sa);
					g_artist.setXmlParam("y", integerToString(pos));
					g_artist.show();
					n++;
					cycle.addItem(g_artist);
				}
				else
				{
					// Title
					if (n > 0) pos += 15;
					t_title.setText(s);
					g_title.setXmlParam("y", integerToString(pos));
					g_title.show();
					n++;
					cycle.addItem(g_title);

					// Artist 
					if (sa != "") {
						if (n > 0) pos += 15;
						t_artist.setText(sa);
						g_artist.setXmlParam("y", integerToString(pos));
						g_artist.show();
						n++;
						cycle.addItem(g_artist);				
					}
				}
			}
		}

		// Stream Album
		s = getPlayItemMetaDataString(metaPrefix + "/album");
		//s = "Ecliptica";
		debugString(DEBUG_PREFIX "  System.getPlayItemMetaDataString(streamtrackalbum): " + s, D_WTF);
		if (s != "")
		{
			if (n > 0) pos += 15;
			t_album.setText(s);
			g_album.setXmlParam("y", integerToString(pos));
			g_album.show();
			n++;
			cycle.addItem(g_album);
		}

/*		// Genre - is not included yet
		s = getPlayItemMetaDataString("streamgenre");
		//s = "Symphonic Metal";
		debugString(DEBUG_PREFIX "  System.getPlayItemMetaDataString(streamgenre): " + s, D_WTF);
		if (s != "")
		{
			t_genre.setText(s);
			cycleGenre.setXmlParam("w", "0");
			cycle.addItem(g_genre);
			if (n > 0) pos += 15;
			g_genre.setXmlParam("y", integerToString(pos));
			g_genre.show();
			n++;
		}
*/
		// Set Stream Name
		if (ss != "")
		{
			if (n > 0) pos += 15;
			t_sname.setText(ss);
			g_sname.setXmlParam("y", integerToString(pos));
			g_sname.show();
			n++;
			cycle.addItem(g_sname);		
		}

		// Stream URL (only visible if we have less than 4 lines till now)
		stationLink = getPlayItemMetaDataString("streamurl");
		//stationLink = "http://radio.shoutcast.com";
		debugString(DEBUG_PREFIX "  System.getPlayItemMetaDataString(streamurl): " + stationLink, D_WTF);
		if (stationLink != "")
		{
			if (n > 0) pos += 15;
			t_surl.setText(stationLink);
			g_surl.setXmlParam("y", integerToString(pos));
			g_surl.show();
			n++;
			cycle.addItem(g_surl);
		}

		// setCover
		s = getPlayItemMetaDataString(metaPrefix + "/albumart");
		if (s != "")
		{
			if (isCbsRadion)
				l_webcover.setXmlParam("image", s);
			else
				l_webcover.setXmlParam("image", "http://broadband-albumart.music.aol.com/scan/" + s);
			if (l_webcover.isInvalid()) l_webcover.setXMLParam("image", WEBCOVER_AOLRADIO);
		}
		else
		{
			if (isAolRadio) l_webcover.setXMLParam("image", WEBCOVER_AOLRADIO);
		}
	}

	// ---------- Local Info ----------
	else
	{
		debugString(DEBUG_PREFIX "  -> No stream is detected! we do the normal procedure", D_WTF);
		l_albumart.show();
		l_webcover.hide();

		string s = getPlayItemMetaDataString("title");
		if (s == "") s = getPlayItemDisplayTitle();
		if (s != "")
		{
			t_title.setText(s);
			g_title.setXmlParam("y", integerToString(pos));
			g_title.show();
			n++;
			cycle.addItem(g_title);
		}

		s = getPlayItemMetaDataString("artist");
		if (s != "")
		{
			if (n > 0) pos += 15;
			t_artist.setText(s);
			g_artist.setXmlParam("y", integerToString(pos));
			g_artist.show();
			n++;
			cycle.addItem(g_artist);
		}

		s = getPlayItemMetaDataString("album");
		if (s != "")
		{
			if (n > 0) pos += 15;
			t_album.setText(s);
			g_album.setXmlParam("y", integerToString(pos));
			g_album.show();
			n++;
			cycle.addItem(g_album);
		}

		if (infocomp_show_track.getData() == "1")
		{
			s = getPlayitemMetaDataString("track");
			if (s != "" && s != "-1")
			{
				// if tracknumber is like 1/9 we display 1 of 9
				if (strsearch(s, "/") != -1)
				{
					s = getToken(s, "/", 0) + translate(" of ") + getToken(s, "/", 1);
				}				
				if (n > 0) pos += 15;
				t_track.setText(s);
				g_track.setXmlParam("y", integerToString(pos));
				g_track.show();
				n++;
				cycle.addItem(g_track);
			}
		}

		if (infocomp_show_year.getData() == "1")
		{
			s = getPlayItemMetaDataString("year");
			if (s != "")
			{
				t_year.setText(s);
				cycle.addItem(g_year);
				if ((!_rating && n < maxlines) || (_rating && n < maxlines-1))
				{
					if (n > 0) pos += 15;
					g_year.setXmlParam("y", integerToString(pos));
					g_year.show();
					n++;
				}
				else
				{
					if (g_Track.getGuiY() == pos) cycleTrack.show();
					cycleYear.show();
					g_year.setXmlParam("y", integerToString(pos));
					if (_cycle) cycler.start();
					else if (getPrivateString (getSkinName(), "FileInfo_usersel", "") == "year")
					{
						if (g_Track.getGuiY() == pos) g_track.hide();
						startwith = cycle.getNumitems() - 1;
						g_year.show();
					}
				}
			}
		}

		if (infocomp_show_genre.getData() == "1")
		{
			s = getPlayItemMetaDataString("genre");
			if (s != "")
			{
				t_genre.setText(s);
				cycle.addItem(g_genre);
				if ((!_rating && n < maxlines) || (_rating && n < maxlines-1))
				{
					if (n > 0) pos += 15;
					g_genre.setXmlParam("y", integerToString(pos));
					g_genre.show();
					n++;
				}
				else
				{
					if (g_Track.getGuiY() == pos) cycleTrack.show();
					if (g_year.getGuiY() == pos) cycleYear.show();
					cycleGenre.show();
					g_genre.setXmlParam("y", integerToString(pos));
					if (_cycle) cycler.start();
					else if (getPrivateString (getSkinName(), "FileInfo_usersel", "") == "genre")
					{
						if (g_Track.getGuiY() == pos) g_Track.hide();
						if (g_year.getGuiY() == pos) g_year.hide();
						startwith = cycle.getNumitems() - 1;
						g_genre.show();
					}
				}
			}
		}
	
		if (infocomp_show_disc.getData() == "1")
		{
			s = getPlayItemMetaDataString("disc");
			if (s != "")
			{
				t_disc.setText(s);
				cycle.addItem(g_disc);
				if ((!_rating && n < maxlines) || (_rating && n < maxlines-1))
				{
					if (n > 0) pos += 15;
					g_disc.setXmlParam("y", integerToString(pos));
					g_disc.show();
					n++;
				}
				else
				{
					if (g_Track.getGuiY() == pos) cycleTrack.show();
					if (g_year.getGuiY() == pos) cycleYear.show();
					if (g_genre.getGuiY() == pos) cycleGenre.show();
					cycleDisc.show();
					g_disc.setXmlParam("y", integerToString(pos));
					if (_cycle) cycler.start();
					else if (getPrivateString (getSkinName(), "FileInfo_usersel", "") == "disc")
					{
						if (g_Track.getGuiY() == pos) g_Track.hide();
						if (g_year.getGuiY() == pos) g_year.hide();
						if (g_genre.getGuiY() == pos) g_genre.hide();
						startwith = cycle.getNumitems() - 1;
						g_disc.show();
					}
				}
			}
		}

		if (infocomp_show_albumartist.getData() == "1")
		{
			s = getPlayItemMetaDataString("albumartist");
			if (s != "")
			{
				t_albumartist.setText(s);
				cycle.addItem(g_albumartist);
				if ((!_rating && n < maxlines) || (_rating && n < maxlines-1))
				{
					if (n > 0) pos += 15;
					g_albumartist.setXmlParam("y", integerToString(pos));
					g_albumartist.show();
					n++;
				}
				else
				{
					if (g_Track.getGuiY() == pos) cycleTrack.show();
					if (g_year.getGuiY() == pos) cycleYear.show();
					if (g_genre.getGuiY() == pos) cycleGenre.show();
					if (g_disc.getGuiY() == pos) cycleDisc.show();
					cycleAlbumartist.show();
					g_albumartist.setXmlParam("y", integerToString(pos));
					if (_cycle) cycler.start();
					else if (getPrivateString (getSkinName(), "FileInfo_usersel", "") == "albumartist")
					{
						if (g_Track.getGuiY() == pos) g_Track.hide();
						if (g_year.getGuiY() == pos) g_year.hide();
						if (g_genre.getGuiY() == pos) g_genre.hide();
						if (g_disc.getGuiY() == pos) cycleDisc.show();
						startwith = cycle.getNumitems() - 1;
						g_albumartist.show();	
					}
				}
			}
		}

		if (infocomp_show_composer.getData() == "1")
		{
			s = getPlayItemMetaDataString("composer");
			if (s != "")
			{
				t_composer.setText(s);
				cycle.addItem(g_composer);
				if ((!_rating && n < maxlines) || (_rating && n < maxlines-1))
				{
					if (n > 0) pos += 15;
					g_composer.setXmlParam("y", integerToString(pos));
					g_composer.show();
					n++;
				}
				else
				{
					if (g_Track.getGuiY() == pos) cycleTrack.show();
					if (g_year.getGuiY() == pos) cycleYear.show();
					if (g_genre.getGuiY() == pos) cycleGenre.show();
					if (g_disc.getGuiY() == pos) cycleDisc.show();
					if (g_albumartist.getGuiY() == pos) cycleAlbumartist.show();
					cycleComposer.show();
					g_composer.setXmlParam("y", integerToString(pos));
					if (_cycle) cycler.start();
					else if (getPrivateString (getSkinName(), "FileInfo_usersel", "") == "composer")
					{
						if (g_Track.getGuiY() == pos) g_Track.hide();
						if (g_year.getGuiY() == pos) g_year.hide();
						if (g_genre.getGuiY() == pos) g_genre.hide();
						if (g_disc.getGuiY() == pos) cycleDisc.show();
						if (g_albumartist.getGuiY() == pos) g_albumartist.hide();
						startwith = cycle.getNumitems() - 1;
						g_composer.show();	
					}
				}
			}
		}

		if (infocomp_show_publisher.getData() == "1")
		{
			s = getPlayItemMetaDataString("publisher");
			if (s != "")
			{
				t_publisher.setText(s);
				cycle.addItem(g_publisher);
				if ((!_rating && n < maxlines) || (_rating && n < maxlines-1))
				{
					if (n > 0) pos += 15;
					g_publisher.setXmlParam("y", integerToString(pos));
					g_publisher.show();
					n++;
				}
				else
				{
					if (g_Track.getGuiY() == pos) cycleTrack.show();
					if (g_year.getGuiY() == pos) cycleYear.show();
					if (g_genre.getGuiY() == pos) cycleGenre.show();
					if (g_disc.getGuiY() == pos) cycleDisc.show();
					if (g_albumartist.getGuiY() == pos) cycleAlbumartist.show();
					if (g_composer.getGuiY() == pos) cycleComposer.show();
					cyclePublisher.show();
					g_publisher.setXmlParam("y", integerToString(pos));
					if (_cycle) cycler.start();
					else if (getPrivateString (getSkinName(), "FileInfo_usersel", "") == "publisher")
					{
						if (g_Track.getGuiY() == pos) g_Track.hide();
						if (g_year.getGuiY() == pos) g_year.hide();
						if (g_genre.getGuiY() == pos) g_genre.hide();
						if (g_disc.getGuiY() == pos) cycleDisc.show();
						if (g_albumartist.getGuiY() == pos) g_albumartist.hide();
						if (g_composer.getGuiY() == pos) g_composer.hide();
						startwith = cycle.getNumitems() - 1;
						g_publisher.show();	
					}
				}
			}
		}

		if (infocomp_show_format.getData() == "1")
		{
			s = system.getDecoderName(system.getPlayItemString());
			if (s != "")
			{
				t_format.setText(s);
				cycle.addItem(g_format);
				if ((!_rating && n < maxlines) || (_rating && n < maxlines-1))
				{
					if (n > 0) pos += 15;
					g_format.setXmlParam("y", integerToString(pos));
					g_format.show();
					n++;
				}
				else
				{
					if (g_Track.getGuiY() == pos) cycleTrack.show();
					if (g_year.getGuiY() == pos) cycleYear.show();
					if (g_genre.getGuiY() == pos) cycleGenre.show();
					if (g_disc.getGuiY() == pos) cycleDisc.show();
					if (g_disc.getGuiY() == pos) cycleDisc.show();
					if (g_albumartist.getGuiY() == pos) cycleAlbumartist.show();
					if (g_composer.getGuiY() == pos) cycleComposer.show();
					if (g_publisher.getGuiY() == pos) cyclePublisher.show();
					cycleFormat.show();
					g_format.setXmlParam("y", integerToString(pos));
					if (_cycle) cycler.start();
					else if (getPrivateString (getSkinName(), "FileInfo_usersel", "") == "format")
					{
						if (g_Track.getGuiY() == pos) g_Track.hide();
						if (g_year.getGuiY() == pos) g_year.hide();
						if (g_genre.getGuiY() == pos) g_genre.hide();
						if (g_albumartist.getGuiY() == pos) g_albumartist.hide();
						if (g_composer.getGuiY() == pos) g_composer.hide();
						if (g_publisher.getGuiY() == pos) g_publisher.hide();
						startwith = cycle.getNumitems() - 1;
						g_format.show();	
					}
				}
			}
		}

		if (_rating && n > 1)
		{
			if (n > 0) pos += 15;
			g_rating.setXmlParam("y", integerToString(pos));
			g_rating.show();	
		}
	}

	if (n=0)
	{
		showBranding();
	}
	debugString(DEBUG_PREFIX "}", D_WTF);
}

//----------------------------------------------------------------------------------------------------------------
// Item Cycler: Only active if we have more items to display as lines
// if you click on a cycle line, this group is saved as g_target
//----------------------------------------------------------------------------------------------------------------

cycler.onTimer ()
{
	// Important: stop the cycler if branding is visible
	if (l_branding.isvisible()) cycler.stop();
	if (infocomp_cycle.getData() == "0" && !quick_change) { cycler.stop(); return; }

	// g_target is defined --> we save the currently shown line as g_target
	if (!g_target)
	{
		// check if rating is visible...
		if (infocomp_show_rating.getData() == "1")
		{
			// if auto-cycler is disabled, and not the default line is shown, the line number is stored in startwith.
			if (startwith)
			{
				// resort the cycle list and set startwith to 0
				for ( int i = maxlines-2; i < startwith; i++ )
				{
					g_target = cycle.enumItem(maxlines-2);
					cycle.removeItem(maxlines-2);
					cycle.addItem(g_target);
				}
				startwith = 0;
			}
			
			// save g_target and remove from cycle
			g_target = cycle.enumItem(maxlines-2);
			cycle.removeItem(maxlines-2);
		}
		else
		{
			if (startwith)
			{
				for ( int i = maxlines-1; i < startwith; i++ )
				{
					g_target = cycle.enumItem(maxlines-1);
					cycle.removeItem(maxlines-1);
					cycle.addItem(g_target);
				}
				startwith = 0;
			}
			g_target = cycle.enumItem(maxlines-1);
			cycle.removeItem(maxlines-1);
		}
		// put g_target at the end of cycle
		cycle.addItem(g_target);
	}

	// otherwise g_target is the last item of cycle
	else g_target = cycle.enumItem(cycle.getNumItems()-1);

	// fade out g_target
	g_target.setTargetA(0);
	g_target.setTargetY(g_target.getGuiY());
	if (!quick_change) g_target.setTargetSpeed(0.25); // fade or quick show/hide
	else g_target.setTargetSpeed(0);
	g_target.gotoTarget();	
}

g_target.onTargetReached ()
{
	if (g_target.getAlpha() == 0)
	{
		// setback g_target to default values
		g_target.hide();
		g_target.setAlpha(255);
		// detect if rating stars are visible and store the line tb shown in g_target
		if (infocomp_show_rating.getData() == "1")
		{
			g_target = cycle.enumItem(maxlines-2);
			cycle.removeItem(maxlines-2);
		}
		else
		{
			g_target = cycle.enumItem(maxlines-1);
			cycle.removeItem(maxlines-1);
		}
		// better set g-target alpha to 0 and, show this line and fade in
		g_target.setAlpha(0);
		g_target.show();
		g_target.setTargetA(255);
		g_target.setTargetY(getGuiY());
		if (!quick_change) g_target.setTargetSpeed(0.25); // fade or quick show/hide
		else 
		{
			g_target.setTargetSpeed(0);
			string v = getToken(g_target.getID(), ".", 2);
			setPrivateString (getSkinName(), "FileInfo_usersel", v); // save current line
		}
		g_target.gotoTarget();
		// add g_target to end of cycle
		cycle.addItem(g_target);
		if (infocomp_cycle.getData() == "1" && !cycler.isRunning()) cycler.start(); // check if we should start cycler
		quick_change = 0;
	}
}

// Automatic cycling through items on/off
infocomp_cycle.onDataChanged ()
{
	if (l_branding.isVisible()) return;
	if (getData() == "1")
	{
		if (cycler_paused) cycler.start();
		else loadFileInfo();
		cycler_paused = 0;
	}
	else
	{
		if (cycler.isRunning()) cycler_paused = 1;
		cycler.stop();
		if (g_track.isVisible()) setPrivateString (getSkinName(), "FileInfo_usersel", "track");
		else if (g_year.isVisible()) setPrivateString (getSkinName(), "FileInfo_usersel", "year");
		else if (g_genre.isVisible()) setPrivateString (getSkinName(), "FileInfo_usersel", "genre");
		else if (g_publisher.isVisible()) setPrivateString (getSkinName(), "FileInfo_usersel", "publisher");
		else if (g_albumartist.isVisible()) setPrivateString (getSkinName(), "FileInfo_usersel", "albumartist");
		else if (g_composer.isVisible()) setPrivateString (getSkinName(), "FileInfo_usersel", "composer");
		else if (g_format.isVisible()) setPrivateString (getSkinName(), "FileInfo_usersel", "format");
		else if (g_disc.isVisible()) setPrivateString (getSkinName(), "FileInfo_usersel", "disc");
	}
}

// Visual Stuff
CycleObject.onEnterArea ()
{
	CycleObject.getParent().findObject("label").setAlpha(255);
}

CycleObject.onLeaveArea ()
{
	CycleObject.getParent().findObject("label").setAlpha(180);
}

CycleObject.onLeftButtonDown (int x, int y)
{
	CycleObject.getParent().findObject("label").setAlpha(220);
}

CycleObject.onLeftButtonUp (int x, int y)
{
	if (getAlpha() < 255) return; 

	setAlpha(255);

	if (quick_change) return;
	quick_change = 1;

	cycler.onTimer ();
}

//----------------------------------------------------------------------------------------------------------------
// If user clicks on a link item (artist, album, title), let's start a web search
// Therefore we will send an action to the group "sui.content". This action is either "browser_navigate" or 
// "browser_search". This action is then proccessed by suicore.maki (showing browser) and then (again) delivered
// to browser.maki (from suicore.maki)
//----------------------------------------------------------------------------------------------------------------

LinkObject.onEnterArea ()
{
	LinkObject.getParent().findObject("label").setAlpha(255);
}

LinkObject.onLeaveArea ()
{
	LinkObject.getParent().findObject("label").setAlpha(180);
}


LinkObject.onLeftButtonDown (int x, int y)
{
	LinkObject.getParent().findObject("label").setAlpha(220);
}

LinkObject.onLeftButtonUp (int x, int y)
{
	if (getAlpha() < 255) return; 

	setAlpha(255);

	string s;
	if (infocomp_browser.getData() == "1")
	{
		if (LinkObject == linkArtist) s = t_artist.getText();
		if (LinkObject == linkAlbum) s = t_artist.getText() + " " + t_album.getText();
		if (LinkObject == linkTitle) s = t_artist.getText() + " " + t_title.getText();
		
		if (s == "") return;

		group sui = scriptGroup.getParentLayout().findObject("sui.content");
		sui.sendAction ("browser_search", s, 0, 0, 0, 0);

		return;
	}
	

	if (stationLink != "" && ( LinkObject == linkSname || LinkObject == linkSurl))
	{
		group sui = scriptGroup.getParentLayout().findObject("sui.content");
		sui.sendAction ("browser_navigate", stationLink, 0, 0, 0, 0);

		return;
	}

	String artist = t_artist.getText();
	if (artist == "") return;
	System.navigateUrlBrowser("http://client.winamp.com/nowplaying/artist/?artistName=" + artist);
}

//----------------------------------------------------------------------------------------------------------------
// Rating System
//----------------------------------------------------------------------------------------------------------------

System.onCurrentTrackRated (int rating)
{
	refreshRating(rating);
}

RatingButton.onLeftButtonDown (int x, int y)
{
	RatingButton.setAlpha(255);
	RatingButton.getParent().findObject("label").setAlpha(220);
}

RatingButton.onleftClick ()
{
	int rating = stringToInteger(getToken(getId(), ".", 1));
	refreshRating(rating);
	setCurrentTrackRating(rating);
	for ( int i = 1; i <= rating; i++ )
	{
		guiobject o = ratingStars.enumItem(i-1);
		o.setAlpha(255);
	}
}

RatingButton.onEnterArea ()
{
	RatingButton.getParent().findObject("label").setAlpha(255);

	int pos = stringToInteger(getToken(getId(), ".", 1));
	int rating = System.getCurrentTrackRating();

	star1.hide();
	star2.hide();
	star3.hide();
	star4.hide();
	star5.hide();

	if (pos >= 1) star1.show();
	if (pos >= 2) star2.show();
	if (pos >= 3) star3.show();
	if (pos >= 4) star4.show();
	if (pos >= 5) star5.show();

	if (pos > rating)
	{
		for ( int i = 1; i <= 5; i++ )
		{
			guiobject o = ratingStars.enumItem(i-1);
			if ( i > pos || i <= rating)
			{
				o.setAlpha(255);
			}
			else
			{
				o.setAlpha(0);
			}
		}
	}
	else
	{
		rate1.setAlpha(255);
		rate2.setAlpha(255);
		rate3.setAlpha(255);
		rate4.setAlpha(255);
		rate5.setAlpha(255);
	}
}

RatingButton.onLeaveArea ()
{
	RatingButton.getParent().findObject("label").setAlpha(180);

	star1.hide();
	star2.hide();
	star3.hide();
	star4.hide();
	star5.hide();
	rate1.setAlpha(255);
	rate2.setAlpha(255);
	rate3.setAlpha(255);
	rate4.setAlpha(255);
	rate5.setAlpha(255);
}

refreshRating (int rating)
{
	rate1.setActivated(rating >= 1);
	rate2.setActivated(rating >= 2);
	rate3.setActivated(rating >= 3);
	rate4.setActivated(rating >= 4);
	rate5.setActivated(rating >= 5);
}

RatingButton.onRightButtonUp (int x, int y)
{
	popupmenu rmenu = new popupmenu;
	rmenu.addcommand("Remove Rating", 1, 0,0);
	int result = rmenu.popAtMouse();
	if (result == 1)
	{
		setCurrentTrackRating(0);
		refreshRating(0);
	}
	complete;
}

t_rating.onTextChanged (String newtxt)
{
	int w = t_rating.getAutoWidth();

	group g = g_rating.findObject("infodisplay.line.rating.stars");
	g.setXmlParam("x", integerToString(w));
	g.setXmlParam("w", integerToString(-w));
	rate0.setXmlParam("w", integerToString(w));
}

//----------------------------------------------------------------------------------------------------------------
// Winamp/AOL Branding
//----------------------------------------------------------------------------------------------------------------

showBranding()
{
	// stop cycler and hide all infolines
	cycler.stop();
	g_cover.setAlpha(0);
	g_rating.hide();
	g_title.hide();
	g_album.hide();
	g_artist.hide();
	g_year.hide();
	g_genre.hide();
	g_track.hide();
	g_publisher.hide();
	g_composer.hide();
	g_format.hide();
	g_albumartist.hide();
	g_surl.hide();
	g_sname.hide();
	g_disc.hide();

	if (ic_vis_fileinfo.getData() == "1")
	{
		_BrandingsetXSpace((g_cover.getGuiW() + 2) / 2);
		_BrandingsetWSpace(-2);
	}
	else
	{
		_BrandingsetXSpace(2);
		_BrandingsetWSpace(-2);
	}
	_BrandinghandleResize();
	l_branding.show();
}

_BrandingsizeError (boolean iserror)
{
	if (iserror)
	{
		l_branding.setAlpha(0);
	}
	else
	{
		l_branding.setAlpha(255);
	}
}

// Hide branding of we start playback
System.onPlay ()
{
	if (ic_fileinfo.getData() == "1" && removePath(getPlayItemString()) == "demo.mp3")
	{
		if (getPlayitemmetadatastring("artist") == "DJ Mike Llama" && getplayitemmetadatastring("title") == "Llama Whippin' Intro")
		{			
			showBranding();
			return;
		}		
	}
	refreshRating(System.getCurrentTrackRating());
	loadFileInfo();
}

ic_fileinfo.onDataChanged ()
{
	if (getData() == "0")
	{
		cycler.stop();
		l_branding.hide();
	}
	else if (l_branding.isVisible())
	{
		showBranding();		
	}
	else
	{
		loadFileInfo();
	}
}

ic_cover_fileinfo.onDataChanged ()
{
	if (l_branding.isVisible())
	{
		showBranding();		
	}
}

ic_vis_fileinfo.onDataChanged ()
{
	if (l_branding.isVisible())
	{
		showBranding();		
	}
}