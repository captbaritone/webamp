#include <lib/std.mi>

Function string tokenizeSongInfo(String tkn, String sinfo);
Function getSonginfo(String SongInfoString);

Global Group frameGroup;
// Global Layer channelDisplay;
Global layer mono, stereo;
Global Text bitrateText, FrequencyText;
Global Timer songInfoTimer;
Global String SongInfoString;
Global layer bufferingStatus;

System.onScriptLoaded(){
	frameGroup = getScriptGroup();

	bitrateText = frameGroup.findObject("Bitrate");
	frequencyText = frameGroup.findObject("Frequency");
	// channelDisplay = frameGroup.findObject("channels");
	bufferingStatus = frameGroup.findObject("BufferingStatus");

	mono = frameGroup.findObject("mono");
    stereo = frameGroup.findObject("stereo");

	songInfoTimer = new Timer;
	songInfoTimer.setDelay(1000);

	// In case the skin just switched to this while audio has been running:
	if (getStatus() == STATUS_PLAYING) {
		bufferingStatus.show();
		// TODO: change to onPlay()
		String sit = getSongInfoText();
		if (sit != "") 
			getSonginfo(sit);
		else 
			songInfoTimer.setDelay(50); // goes to 1000 once info is available
		songInfoTimer.start();

	} else if (getStatus() == STATUS_PAUSED) {
		bufferingStatus.hide();	
		//TODO: change to onPause
		getSonginfo(getSongInfoText());	

	} else if (getStatus() == STATUS_STOPPED) {
		bufferingStatus.hide();
        bufferingStatus.setXmlParam("image", "traffic.green");
	}
}

System.onScriptUnloading(){
	delete songInfoTimer;
}

System.onPlay(){
	bufferingStatus.show();
	String sit = getSongInfoText();
	if (sit != "") getSonginfo(sit);
	else songInfoTimer.setDelay(50); // goes to 1000 once info is available
	songInfoTimer.start();

}

System.onStop(){
	bufferingStatus.hide();
	songInfoTimer.stop();
	frequencyText.setText("");
	bitrateText.setText("");
	// channelDisplay.setXmlParam("image", "player.songinfo.none");
	mono.setXmlParam("image", "player.status.mono.inactive");
	stereo.setXmlParam("image", "player.status.stereo.inactive");

}

System.onResume(){
	bufferingStatus.show();
	String sit = getSongInfoText();
	if (sit != "") getSonginfo(sit);
	else songInfoTimer.setDelay(50); // goes to 1000 once info is available
	songInfoTimer.start();
}

System.onPause(){
	bufferingStatus.hide();
	songInfoTimer.stop();
}

songInfoTimer.onTimer(){
	String sit = getSongInfoText();
	if (sit == "") return;
	songInfoTimer.setDelay(1000);
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
	int bitrateint, freqint;

	//? RATE KBps
	tkn = tokenizeSongInfo("Bitrate", SongInfoString);
	if(tkn != "") {bitrateText.setText(tkn);}
	bitrateint = System.Stringtointeger(tkn);

	// MONO | STEREO | SURROUND
	tkn = tokenizeSongInfo("Channels", SongInfoString);
	// channelDisplay.setXmlParam("image", "player.songinfo." + tkn);
    if(tkn == "mono"){
        mono.setXmlParam("image", "player.status.mono.active");
        stereo.setXmlParam("image", "player.status.stereo.inactive");
	} else {
		// surround, stereo, 3channels, etc
        mono.setXmlParam("image", "player.status.mono.inactive");
        stereo.setXmlParam("image", "player.status.stereo.active");
	}

	// FREQUENCY KHz
	tkn = tokenizeSongInfo("Frequency", SongInfoString);
	frequencyText.setText(tkn);
	freqint = System.Stringtointeger(tkn);

	// IS BUFFERING ( NETWORK STATUS )
	if(bufferingStatus.isVisible()) {	
		String currenttitle = System.strlower(System.getPlayItemDisplayTitle());
		
		if(System.strsearch(currenttitle, "[timed out") != -1){
			bufferingStatus.setXmlParam("image", "traffic.red");
		}
		else if(System.strsearch(currenttitle, "[connecting") != -1){
			bufferingStatus.setXmlParam("image", "traffic.red");
		}
		else if(System.strsearch(currenttitle, "[resolving hostname") != -1){
			bufferingStatus.setXmlParam("image", "traffic.red");
		}
		else if(System.strsearch(currenttitle, "[http/1.1") != -1){
			bufferingStatus.setXmlParam("image", "traffic.red");
		}
		else if(System.strsearch(currenttitle, "[buffer") != -1){
			bufferingStatus.setXmlParam("image", "traffic.red");
		}else{
			if(bitrateint == 0 || bitrateint == -1 && freqint == 0 || freqint == -1){
				bufferingStatus.setXmlParam("image", "traffic.red"); 
				// setPlaysymbol.start(); x2nie: I dont care network status for now.
			}
			if(bitrateint > 0 && freqint > 0){
				// setPlaysymbol.start(); 
				bufferingStatus.setXmlParam("image", "traffic.green");
			}
		}
	}
}