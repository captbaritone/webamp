#include "../../../lib/std.mi"

Function string tokenizeSongInfo(String tkn, String sinfo);

Global GuiObject mono, stereo;
Global Text bitrateText, infolineExampleText, FrequencyText, abrText;
Global Layout dummyMain;
Global group Main;
Global Timer songInfoTimer;
Global String SongInfoString;

System.onScriptLoaded(){
	dummyMain = getContainer("Main").getLayout("Normal");
	Main = dummyMain.getObject("main.mmd3");
	infolineExampleText = Main.getObject("infolinegrab");

	mono = Main.getObject("monodis");
	stereo = Main.getObject("stereodis");

	bitrateText = Main.getObject("Bitrate");
	frequencyText = Main.getObject("Frequency");

	//abrText = Main.getObject("ABR");

	songInfoTimer = new Timer;
	songInfoTimer.setDelay(1000);
	if (getLeftVUMeter()!=null) songInfoTimer.start();
	mono.hide();
	stereo.hide();
}

System.onScriptUnloading(){
	delete songInfoTimer;
}

System.onPlay(){
	songInfoTimer.start();
}

System.onStop(){
	songInfoTimer.stop();
	frequencyText.setText("");
	bitrateText.setText("");
        mono.hide();
        stereo.hide();
}

System.onResume(){
	songInfoTimer.start();
}

System.onPause(){
	songInfoTimer.stop();
}


infolineExampleText.onTextChanged(String newtxt) {
  if(newtxt=="-") {
    infolineExampleText.setText("");
	return;
  }
  String tkn, songinfo;
  songinfo = strupper(newtxt);

  mono.hide();
  stereo.hide();
  if(strsearch(songinfo, "STEREO") > 0) stereo.show();
}

songInfoTimer.onTimer(){
String tkn;
	SongInfoString = infolineExampleText.getText();

	tkn = tokenizeSongInfo("Bitrate", SongInfoString);
	if(tkn != "") {bitrateText.setText(tkn);}

/*	tkn = tokenizeSongInfo("ABR", SongInfoString);
	if(tkn != "") {abrText.setText(tkn);}
*/
	tkn = tokenizeSongInfo("Channels", SongInfoString);

	tkn = tokenizeSongInfo("Frequency", SongInfoString);
	if(tkn != "") {frequencyText.setText(tkn);}
}

tokenizeSongInfo(String tkn, String sinfo){
int searchResult;
String rtn;
if (tkn=="Bitrate"){
		for (int i = 0; i < 5; i++) {
			rtn = getToken(sinfo, " ", i);
			searchResult = strsearch(rtn, "kbps");
			if (searchResult>0) return Strleft(rtn, 3);
		}
		return "";
}

if (tkn=="Channels"){
		for (int i = 0; i < 5; i++) {
			rtn = getToken(sinfo, " ", i);
			searchResult = strsearch(rtn, "tereo");
			stereo.show();
			mono.hide();
			if (searchResult>0) return rtn;
			searchResult = strsearch(rtn, "ono");
			mono.show();
			stereo.hide();
			if (searchResult>0) return rtn;
		}
		return "";
}
if (tkn=="Frequency"){
		for (int i = 0; i < 5; i++) {
			rtn = getToken(sinfo, " ", i);
			searchResult = strsearch(strlower(rtn), "khz");
			if (searchResult>0) return Strleft(rtn, 2);
		}
		return "";
}
if (tkn=="ABR"){
		for (int i = 0; i < 5; i++) {
			rtn = getToken(sinfo, " ", i);
			searchResult = strsearch(rtn, "bps)");
			if (searchResult>0) return rtn;
		}
		return "";
}


else return "";
}