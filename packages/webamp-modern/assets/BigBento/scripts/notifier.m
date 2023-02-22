/*---------------------------------------------------
-----------------------------------------------------
Filename:	notifier.m
Version:	1.3

Type:		maki/notifier
Date:		14. Mrz. 2007 - 14:50 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu

Note:		Based on notifier.m from Winamp Modern
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>
#include attribs/init_notifier.m

Function reset();
Function createNotifier();
Function showNotifier(Int w);
Function onNext();

Function Int fillNextTrackInfo(String corneroverride);
Function Int fillCustomInfo(String customstring);

Function checkPref(int bypassfs);

Function getArtist();

Global Container notifier_container;
Global Layout notifier_layout;
Global Timer notifier_timer;
Global String last_autotitle, last_autopis;

Global Boolean b_tohide = 0;

// ------------------------------------------------------------------------------
// init
// ------------------------------------------------------------------------------
System.onScriptLoaded() {
	initAttribs_notifier();
	notifier_timer = new Timer;
}

// ------------------------------------------------------------------------------
// shutdown
// ------------------------------------------------------------------------------
System.onScriptUnloading() {
	delete notifier_timer;
}

// ------------------------------------------------------------------------------
// called by the system when the global hotkey for notification is pressed
// ------------------------------------------------------------------------------
System.onShowNotification() {
	//if (checkPref(1)) return; --mp: if we push the hotkey, we want to show the notifier, no matter what the pref settings are.
	createNotifier();
	String str;
	if (getStatus() == STATUS_PLAYING) str = "Playing";
	if (getStatus() == STATUS_PAUSED) str = "Playback Paused";
	if (getStatus() == STATUS_STOPPED) str = "Playback Stopped";
	showNotifier(fillNextTrackInfo(str));
	complete; // prevents other scripts from getting the message
	return 1; // tells anybody else that might watch the returned value that, yes, we implemented that
}

// ------------------------------------------------------------------------------
// called by the system when the title for the playing item changes, this could be the result of the player
// going to the next track, or of an update in the track title
// ------------------------------------------------------------------------------
System.onTitleChange(String newtitle) {
	if (StrLeft(newtitle, 1) == "[") {
		if (StrLeft(newtitle, 7) == "[Buffer" ||
				StrLeft(newtitle, 4) == "[ICY") return;
	}
	String newpis = System.getPlayItemString();
	if (last_autotitle == newtitle && last_autopis == newpis) return;
	last_autotitle = newtitle;
	last_autopis = newpis;
	onNext();
}

// ------------------------------------------------------------------------------
// called by the system when the user clicks the next button
// ------------------------------------------------------------------------------
onNext() {
	if (checkPref(0)) return;
	createNotifier();
	showNotifier(fillNextTrackInfo(""));
}

// ------------------------------------------------------------------------------
// called by the system when the user clicks the play button
// ------------------------------------------------------------------------------
System.onPlay() {
	if (checkPref(0)) return;
	createNotifier();
	showNotifier(fillNextTrackInfo("Playing"));
}

// ------------------------------------------------------------------------------
// called by the system when the user clicks the pause button
// ------------------------------------------------------------------------------
System.onPause() {
	if (checkPref(0)) return;
	createNotifier();
	showNotifier(fillCustomInfo("Playback Paused"));
}

// ------------------------------------------------------------------------------
// called by the system when the user clicks the pause button again
// ------------------------------------------------------------------------------
System.onResume() {
	if (checkPref(0)) return;
	createNotifier();
	showNotifier(fillNextTrackInfo("Resuming Playback"));
}

// ------------------------------------------------------------------------------
// called by the system when the user clicks the play button
// ------------------------------------------------------------------------------
System.onStop() {
	if (checkPref(0)) return;
	createNotifier();
	showNotifier(fillCustomInfo("End of Playback"));
}

// ------------------------------------------------------------------------------
// checks if we should display anything
// ------------------------------------------------------------------------------
Int checkPref(int bypassfs) {
	if (!bypassfs && notifier_hideinfullscreen_attrib.getData() == "1" && isVideoFullscreen()) return 1;
	if (notifier_never_attrib.getData() == "1") return 1;
	if (notifier_minimized_attrib.getData() == "1" && !isMinimized()) return 1;
	if (notifier_windowshade_attrib.getData() == "1") {
		if (isMinimized()) return 0;
		Container c = getContainer("main");
		if (!c) return 1;
		Layout l = c.getCurLayout();
		if (!l) return 1;
		if (l.getId() != "shade") return 1;
	}
	return 0;
}

// ------------------------------------------------------------------------------
// fade in/out completed
// ------------------------------------------------------------------------------
// TODO: on dual monitors the notif stays on 2nd monitor :(
notifier_layout.onTargetReached() {
	if (b_tohide) {
		notifier_layout.setAlpha(0);
		reset();	
		return;
	}
	int a = notifier_layout.getAlpha();
	if (a == 255 && !b_tohide) {
		notifier_timer.setDelay(StringToInteger(notifier_holdtime_attrib.getData()));
		notifier_timer.start();
	}
	else if (a == 0) {
		reset();
	}
}

// ------------------------------------------------------------------------------
// hold time elapsed
// ------------------------------------------------------------------------------
notifier_timer.onTimer() {
	stop();
	if (notifier_fdout_alpha.getData() == "1") {
		if (notifier_layout.isTransparencySafe()) {
			notifier_layout.setTargetA(0);
			notifier_layout.setTargetSpeed(StringToInteger(notifier_fadeouttime_attrib.getData()) / 1000);
			notifier_layout.gotoTarget();
			return;
		}
		else {
			reset();
			return;
		}
	}
	else if (notifier_fdout_vslide.getData() == "1") {
		b_tohide = 1;
		int sy;
		int geth;
		if (notifier_loc_vport_attrib.getData() == "1")
		{
			geth = getViewportHeight();
		}
		else
		{
			geth = getMonitorHeight();
		}
		if (notifier_layout.getGuiY() == 2) sy = -80;
		else sy = geth + 80;
		notifier_layout.setTargetY(sy);
		notifier_layout.setTargetSpeed(StringToInteger(notifier_fadeintime_attrib.getData()) / 1000);
		notifier_layout.gotoTarget();
		return;
	}
	else {
		if (b_tohide) return;
		b_tohide = 1;
		int sx;
		int getw;
		if (notifier_loc_vport_attrib.getData() == "1") {
			getw = getViewportWidth();
		}
		else {
			getw = getMonitorWidth();
		}

		if (notifier_layout.getGuiX() == 2) sx = -notifier_layout.getWidth();
		else sx = getw + notifier_layout.getWidth();
		notifier_layout.setTargetX(sx);
		notifier_layout.setTargetSpeed(StringToInteger(notifier_fadeintime_attrib.getData()) / 1000);
		notifier_layout.gotoTarget();
		return;
	}
}

// ------------------------------------------------------------------------------
// when notifier is clicked, bring back the app from minimized state if its minimized and focus it
// ------------------------------------------------------------------------------
notifier_layout.onLeftButtonDown(int x, int y) {
	notifier_timer.stop();
	notifier_layout.cancelTarget();
	reset();
	restoreApplication();
	activateApplication();
	if (notifier_opennowplaying_attrib.getData() == "1")
	{
		String artist = getArtist();
		if (artist == "") return;
		System.navigateUrlBrowser("http://client.winamp.com/nowplaying/artist/?artistName=" + artist);	
	}
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

// ------------------------------------------------------------------------------
// close the notifier window, destroys the container automatically because it's dynamic
// ------------------------------------------------------------------------------
reset() {
	notifier_container.close();
	notifier_container = NULL;
	notifier_layout = NULL;
}

// ------------------------------------------------------------------------------
createNotifier() {
	if (notifier_container == NULL) {
		notifier_container = newDynamicContainer("notifier");
		if (!notifier_container) return; // reinstall duh!
		if (isDesktopAlphaAvailable())
			notifier_layout = notifier_container.getLayout("desktopalpha");
		else
			notifier_layout = notifier_container.getLayout("normal");
		if (!notifier_layout) return; // reinstall twice, man
	} else {
		notifier_layout.cancelTarget();
		notifier_timer.stop();
	}
}

// ------------------------------------------------------------------------------
showNotifier(int w) {
	DebugString(IntegerToString(w), 0);
	b_tohide = 0;
	int x; int y;
	int sy; int sx;
	w = w + 30;

	int getx, gety, geth, getw;
	if (notifier_loc_vport_attrib.getData() == "1")
	{
		getx = getViewportLeft();
		gety = getViewportTop();
		geth = getViewportHeight();
		getw = getViewportWidth();
	}
	else
	{
		getx = 0;
		gety = 0;
		geth = getMonitorHeight();
		getw = getMonitorWidth();		
	}
	if (notifier_loc_br_attrib.getData() == "1") {
		x = getw + getx - w - 2;
		y = geth + gety - 80 - 2;
	}
	else if (notifier_loc_bl_attrib.getData() == "1") {
		x = 2;
		y = geth + gety - 80 - 2;
	}
	else if (notifier_loc_bc_attrib.getData() == "1") {
		x = (getw + getx - w) / 2;
		y = geth + gety - 80 - 2;
	}
	else if (notifier_loc_tr_attrib.getData() == "1") {
		x = getw + getx - w - 2;
		y = 2;
	}
	else if (notifier_loc_tc_attrib.getData() == "1") {
		x = (getw + getx - w) / 2;
		y = 2;
	}
	else {
		x = 2;
		y = 2;
	}
	if (notifier_fdin_alpha.getData() == "1") {
		if (!notifier_layout.isVisible()) notifier_layout.resize(x, y, w, 80);
		else
		{
			notifier_layout.resize(notifier_layout.getguiX(), y, notifier_layout.getGuiW(), 80);
		}
		if (notifier_layout.isTransparencySafe()) {
			notifier_layout.show();
			notifier_layout.settargetA(255);
			notifier_layout.setTargetX(x);
			notifier_layout.setTargetY(y);
			notifier_layout.setTargetW(w);
			notifier_layout.setTargetH(80);
			notifier_layout.setTargetSpeed(StringToInteger(notifier_fadeintime_attrib.getData()) / 1000);
			notifier_layout.gotoTarget();
		} else {
			notifier_layout.setAlpha(255);
			notifier_layout.show();
			notifier_layout.settargetA(255);
			notifier_layout.setTargetX(x);
			notifier_layout.setTargetY(y);
			notifier_layout.setTargetW(w);
			notifier_layout.setTargetH(80);
			notifier_timer.setDelay(StringToInteger(notifier_holdtime_attrib.getData()));
			notifier_timer.start();
		}
	}
	else if (notifier_fdin_vslide.getData() == "1") {
		if (y == 2) sy = -80;
		else sy = geth + 80;
		if (!notifier_layout.isVisible()) notifier_layout.resize(x, sy, w, 80);
		else
		{
			notifier_layout.resize(notifier_layout.getguiX(), y, notifier_layout.getGuiW(), 80);
		}
		notifier_layout.show();
		notifier_layout.setAlpha(255);
		notifier_layout.setTargetX(x);
		notifier_layout.setTargetY(y);
		notifier_layout.setTargetW(w);
		notifier_layout.setTargetH(80);
		notifier_layout.setTargetSpeed(StringToInteger(notifier_fadeintime_attrib.getData()) / 1000);
		notifier_layout.gotoTarget();
	}
	else {
		if (x < (getw + getx)/2) sx = -w;
		else sx = getw + w;
		if (!notifier_layout.isVisible()) {
			notifier_layout.resize(sx, y, w, 80);
		}
		else {
			notifier_layout.resize(notifier_layout.getguiX(), y, notifier_layout.getGuiW(), 80);
		}
		notifier_layout.show();
		notifier_layout.setAlpha(255);
		notifier_layout.setTargetX(x);
		notifier_layout.setTargetY(y);
		notifier_layout.setTargetW(w);
		notifier_layout.setTargetH(80);
		notifier_layout.setTargetSpeed(StringToInteger(notifier_fadeintime_attrib.getData()) / 1000);
		notifier_layout.gotoTarget();
	}
}

// ------------------------------------------------------------------------------
Int fillNextTrackInfo(String corneroverride) {
	Int maxv = 0;
	Int stream = 0;
	Boolean isAolRadio = 0;

	if (!notifier_layout) return 0;

	Group g_text = notifier_layout.findObject("notifier.text");
	Group g_albumart = notifier_layout.findObject("notifier.albumart");

	Text plentry = g_text.findObject("plentry");
	Text nexttrack = g_text.findObject("nexttrack");
	Text _title = g_text.findObject("title");
	Text album = g_text.findObject("album");
	Text artist = g_text.findObject("artist");
	Text endofplayback = notifier_layout.findObject("endofplayback");
	Text s_plentry = g_text.findObject("plentry.shadow");
	Text s_nexttrack = g_text.findObject("nexttrack.shadow");
	Text s_title = g_text.findObject("title.shadow");
	Text s_album = g_text.findObject("album.shadow");
	Text s_artist = g_text.findObject("artist.shadow");
	Text s_endofplayback = notifier_layout.findObject("endofplayback.shadow");

	DebugString("got callback for " + getPlayItemString(), 0);

	// Get Stream Name - if no stream returns ""
	string s = getPlayItemMetaDataString("streamname");
	string stype = getPlayItemMetaDataString("streamtype"); //"streamtype" will return "2" for SHOUTcast and "3" for AOL Radio

	// Are we listening to AOl Radio (uvox://)
	isAolRadio = (stype == "3");
	// map CBS/StreamTheWorld to AOL Radio
	isAolRadio = (isAolRadio||(strsearch(getPlayItemString(), "208.80.52.") >= 0));
	isAolRadio = (isAolRadio||(strsearch(getPlayItemString(), "208.80.53.") >= 0));
	isAolRadio = (isAolRadio||(strsearch(getPlayItemString(), "208.80.54.") >= 0));
	isAolRadio = (isAolRadio||(strsearch(getPlayItemString(), "208.80.55.") >= 0));

	if (stype == "2" || isAolRadio) stream = 1;

	if (endofplayback) endofplayback.hide();
	if (s_endofplayback) s_endofplayback.hide();

	if (plentry)
	{ 
		plentry.setText(integerToString(getPlaylistIndex()+1)+translate(" of ")+integerToString(getPlaylistLength()));
		plentry.show();
		s_plentry.setText(integerToString(getPlaylistIndex()+1)+translate(" of ")+integerToString(getPlaylistLength()));
		s_plentry.show();
	}
	if (nexttrack) {
		if (corneroverride == "") {
			if (!stream) {
				if (!isVideo())
				{
					nexttrack.setText("New track");
					s_nexttrack.setText("New track");
				}
				else
				{
					nexttrack.setText("New video");
					s_nexttrack.setText("New video");					
				}
			}
			else
			{
				if (isAolRadio)
				{
					nexttrack.setText("AOL Radio");
					s_nexttrack.setText("AOL radio");	
				}
				else
				{
					nexttrack.setText("On air");
					s_nexttrack.setText("On air");			
				}
			}
		} 
		else
		{
			nexttrack.setText(corneroverride);
			s_nexttrack.setText(corneroverride);
		}
		nexttrack.show();
		s_nexttrack.show();
	}
	string set_artist = "";
	string set = "";
	if (_title) {
		_title.setXmlParam("ticker", "0");
		_title.setXmlParam("display", "");
		s_title.setXmlParam("ticker", "0");
		s_title.setXmlParam("display", "");
		String str;
		if (!stream)
		{
			str = getPlayitemMetaDataString("title"); 
			if (str == "") str = getPlayitemDisplayTitle();
			String l = getPlayItemMetaDataString("length");
			if (l != "") {
				str += " (" + integerToTime(stringtointeger(l)) + ")";
			}
			_title.setText(str);
			s_title.setText(str);
		}
		else
		{
			if (isAolRadio && str = getPlayItemMetaDataString("uvox/title") != "")
			{
					_title.setText(str);
					s_title.setText(str);
			}
			else if (str = getPlayItemMetaDataString("streamtitle") != "")
			{
				int v = strsearch(str, " - "); // We divide the string by a " - " sublimiter - no luck for old / wrong tagged stations
				if (v > 0) {
					set_artist = strleft (str, v); // Store artist
					string str = strright (str, strlen(str) - 3 - v);
	 
					_title.setText(str);
					s_title.setText(str);	
					
				}
				else
				{
					_title.setXmlParam("ticker", "1"); // These titles can be _very_ long
					s_title.setXmlParam("ticker", "1");
					_title.setText(str);
					s_title.setText(str);	
				}
			} else
			{
				_title.setXmlParam("ticker", "1");
				_title.setXmlParam("display", "songtitle");
				_title.setText("");
				s_title.setXmlParam("ticker", "1");
				s_title.setXmlParam("display", "songtitle");
				s_title.setText("");			
			}
		}
		_title.show(); 
		s_title.show(); 
	}
	if (artist) { 
		if (!stream) {
			if (isVideo())
			{
				artist.setText(""); 
				s_artist.setText("");
			}
			else
			{
				artist.setText(getPlayitemMetaDataString("artist")); 
				s_artist.setText(getPlayitemMetaDataString("artist"));				
			}
 		}
		else
		{
			// Check first if we're playing AOL Radio
			if (isAolRadio && set = getPlayItemMetaDataString("uvox/artist") != "")
			{
				artist.setText(set); 
				s_artist.setText(set);				
			}
			// Perhaps we've stored the artist before?
			else if (set_artist != "")
			{
				artist.setText(set_artist); 
				s_artist.setText(set_artist);					
			}
			// Then display the station name
			else if (s != "")
			{
				artist.setText(s); 
				s_artist.setText(s);					
			}
			// So, we've had no luck - just display a static text :(
			else
			{
				if (isVideo())
				{
					artist.setText("Internet TV"); 
					s_artist.setText("Internet TV");
				}
				else
				{
					artist.setText("Internet Radio"); 
					s_artist.setText("Internet Radio");				
				}
			}
		}
		artist.show(); 
		s_artist.show();
	}
	if (album) { 
		String str;
		if (!stream && !isVideo()) {
			s_album.setXmlParam("display", "");
			album.setXmlParam("display", "");
			str = getPlayitemMetaDataString("album");
			String l = getPlayitemMetaDataString("track");
			if (l != "" && l != "-1") str += " (" + translate("Track ") + l + ")";
			album.setText(str); 
			s_album.setText(str); 
		}
		else
		{
			album.setXmlParam("display", "");
			s_album.setXmlParam("display", "");
			// Playing AOL Radio with metadata?
			if (isAolRadio && set = getPlayItemMetaDataString("uvox/album") != "")
			{
				album.setText(set);
				s_album.setText(set);
			}
			// we have divided the songname - let's display the station name
			else if (set_artist != "" && s != "")
			{
				album.setText(s); 
				s_album.setText(s);					
			}
			// no luck either...
			else
			{
				album.setText("");
				album.setXmlParam("display", "songinfo_localise");
				s_album.setText("");
				s_album.setXmlParam("display", "songinfo_localise");
			}
		}
		album.show(); 
		s_album.show(); 
	}

	// Album Art Stuff

	layer cover, webcover;
	if (g_albumart)
	{
		cover = g_albumart.findObject("notifier.cover");
		webcover = g_albumart.findObject("notifier.webcover");
	}

	Boolean showAlbumArt = FALSE;

	if (cover != NULL && webcover != NULL)
	{
		if (stream)
		{
			// Detect if we are listening to AOL Radio
			if (strlower(strleft(getPlayItemString(), 4)) == "uvox")
			{
				s = getPlayItemMetaDataString("uvox/albumart");
				if (s != "")
				{
					webcover.setXmlParam("image", "http://broadband-albumart.music.aol.com/scan/" + s);
					if (webcover.isInvalid())
					{
						showAlbumArt = FALSE;
					}
					else
					{
						cover.hide();
						webcover.show();
						showAlbumArt = TRUE;
					}
				}
			}
		}
		else
		{
			if (cover.isInvalid()) // Check if the album art obj shows a pic
			{
				showAlbumArt = FALSE;
			}
			else
			{
				webcover.hide();
				cover.show();
				showAlbumArt = TRUE;				
			}
		}
	}
	
	if (showAlbumArt)
	{
		if (g_albumart) g_albumart.show();
		if (g_text) g_text.setXmlParam("x", "75");
		if (g_text) g_text.setXmlParam("w", "-95");		
	}
	else
	{
		if (g_albumart) g_albumart.hide();
		if (g_text) g_text.setXmlParam("x", "15");
		if (g_text) g_text.setXmlParam("w", "-35");		
	}
	
	if (g_text) g_text.show();	

	maxv = artist.getAutoWidth();
	if (maxv < album.getAutoWidth()) maxv = album.getAutoWidth();
	if (maxv < _title.getAutoWidth()) maxv = _title.getAutoWidth();
	if (maxv < (plentry.getAutoWidth() + nexttrack.getAutoWidth())) maxv = (plentry.getAutoWidth() + nexttrack.getAutoWidth());
	if (maxv < 128) maxv = 128;

	int getw;
	if (notifier_loc_vport_attrib.getData() == "1")
	{
		getw = getViewportWidth();
	}
	else
	{
		getw = getMonitorWidth();		
	}

	if (maxv > getw/4) maxv = getw/4;
	
	
	return maxv + ( showAlbumArt * 60 ) + 1; // Adds 60 extra pixels if album art is visible
}

// ------------------------------------------------------------------------------
Int fillCustomInfo(String customtext)
{
	Group g_text = notifier_layout.findObject("notifier.text");
	Group g_albumart = notifier_layout.findObject("notifier.albumart");

	Text endofplayback = notifier_layout.findObject("endofplayback");
	Text s_endofplayback = notifier_layout.findObject("endofplayback.shadow");

	if (g_text) { g_text.hide(); }
	if (g_albumart) g_albumart.hide();

	if (endofplayback != NULL && s_endofplayback  != NULL) {
		endofplayback.setText(translate(customtext)+" ");
		s_endofplayback.setText(translate(customtext)+" ");
		int aw = endofplayback.getAutoWidth();
		endofplayback.show();
		s_endofplayback.show();
		if (aw > 128)
			return aw;
	}
	return 128;
}