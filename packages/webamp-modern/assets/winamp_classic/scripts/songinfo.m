//Helper library for the play symbol to switch it's green or red state
//according to the available kbps and khz data.

Function string tokenizeSongInfo(String tkn, String sinfo);
Function getSonginfo(String SongInfoString);
Function initSongInfoGrabber();
Function deleteSongInfoGrabber();
Global Timer songInfoTimer;
Global String SongInfoString;

Global int bitrateint, freqint;

initSongInfoGrabber(){

	songInfoTimer = new Timer;
	songInfoTimer.setDelay(250);

	if (getStatus() == STATUS_PLAYING) {
		String sit = getSongInfoText();
		if (sit != "") getSonginfo(sit);
		else songInfoTimer.setDelay(250); // goes to 250ms once info is available
		songInfoTimer.start();
	} else if (getStatus() == STATUS_PAUSED) {
		getSonginfo(getSongInfoText());
	}
}

deleteSongInfoGrabber(){
	delete songInfoTimer;
}

songInfoTimer.onTimer(){
	String sit = getSongInfoText();
	if (sit == "") return;
	songInfoTimer.setDelay(250);
	getSonginfo(sit);
}

String tokenizeSongInfo(String tkn, String sinfo){
	int searchResult;
	String rtn;
	if (tkn=="Bitrate"){
		for (int i = 0; i < 5; i++) {
			rtn = getToken(sinfo, " ", i);
			searchResult = strsearch(rtn, "kbps");
			if (searchResult>0) return StrMid(rtn, 0, searchResult);
		}
		return "";
	}

	if (tkn=="Channels"){
		for (int i = 0; i < 5; i++) {
			rtn = getToken(sinfo, " ", i);
			searchResult = strsearch(rtn, "tereo");
			if (searchResult>0) return "stereo";
			searchResult = strsearch(rtn, "ono");
			if (searchResult>0) return "mono";
			// Martin: surround > 3, stereo = 2,3
			searchResult = strsearch(rtn, "annels");
			if (searchResult>0)
			{
				int pos = strsearch(getSongInfoText(), "annels");
				pos = stringToInteger(strmid(getSongInfoText(), pos - 4, 1));
				if (pos > 3) return "surround";
				if (pos > 1 && pos < 4) return "stereo";
				else return "mono";
			}
		}
		return "none";
	}

	if (tkn=="Frequency"){
		for (int i = 0; i < 5; i++) {
			rtn = getToken(sinfo, " ", i);
			searchResult = strsearch(strlower(rtn), "khz");
			if (searchResult>0) {
				String r = StrMid(rtn, 0, searchResult);
				int dot = StrSearch(r, ".");
				if (dot == -1) dot = StrSearch(r, ",");
				if (dot != -1) return StrMid(r, 0, dot);
				return r;
			}

		}
		return "";
	}
	else return "";
}

getSonginfo(String SongInfoString) {
	String tkn;

	tkn = tokenizeSongInfo("Bitrate", SongInfoString);
    bitrateint = System.Stringtointeger(tkn);

	tkn = tokenizeSongInfo("Frequency", SongInfoString);
    freqint = System.Stringtointeger(tkn);
}