//Attempts to emulate to the best of it's abilities, the play symbol
//aka the green and red LED's found in the Classic Skins.
//Handles empty kbps and khz and streaming related things.

#include "..\..\..\lib/std.mi"
#include "songinfo.m"

Global Group player;
Global layer playstatus;
Global timer setPlaysymbol;

Function setState();
Function setState2();

System.onScriptLoaded(){

    initSongInfoGrabber();

    Group player = getScriptGroup();

    playstatus = player.findObject("playbackstatus");

    setPlaysymbol = new Timer;
	setPlaysymbol.setDelay(250);

    setState();
    setState2();

    if(getStatus() == 1){
        playstatus.setXmlParam("visible", "1");
    }else if(getStatus() == -1){
        playstatus.setXmlParam("visible", "0");
    }else if(getStatus() == 0){
        playstatus.setXmlParam("visible", "0");
        playstatus.setXmlParam("image", "wa.play.green");
    }
}

System.onScriptUnloading(){
    deleteSongInfoGrabber();
}

System.onPause(){
    songInfoTimer.stop();

    playstatus.setXmlParam("visible", "0");
}

System.onResume()
{
    String sit = getSongInfoText();
    String bitratestring = integerToString(bitrateint);
    String freqstring = integerToString(freqint);
	if (sit != "") getSonginfo(sit);
	else songInfoTimer.setDelay(250); // goes to 250ms once info is available
	songInfoTimer.start();
    setState2();

	//setPlaysymbol.start();
    playstatus.setXmlParam("visible", "1");
    //messageBox(bitratestring, freqstring, 0, "");
}

System.onPlay()
{
    String sit = getSongInfoText();
	if (sit != "") getSonginfo(sit);
	else songInfoTimer.setDelay(250); // goes to 250ms once info is available
	songInfoTimer.start();
    setState2();

	//setPlaysymbol.start();
    playstatus.setXmlParam("visible", "1");
}

System.onTitleChange(String newtitle)
{
    String sit = getSongInfoText();
	if (sit != "") getSonginfo(sit);
	else songInfoTimer.setDelay(250); // goes to 250ms once info is available
	songInfoTimer.start();
    setState2();

    if(getStatus() == 1){
        playstatus.setXmlParam("visible", "1");
        //setPlaysymbol.start();
    }else if(getStatus() == -1){
        playstatus.setXmlParam("visible", "0");
        setPlaysymbol.stop();
    }else if(getStatus() == 0){
        setPlaysymbol.stop();
        playstatus.setXmlParam("visible", "0");
        playstatus.setXmlParam("image", "wa.play.green");
    }
}

System.onStop(){
    songInfoTimer.stop();

    //setPlaysymbol.stop();
    playstatus.setXmlParam("visible", "0");
    playstatus.setXmlParam("image", "wa.play.green");
}

setPlaysymbol.onTimer()
{
    setState();
}

setState(){
    if(getPosition() < getPlayItemLength()-500){
        playstatus.setXmlParam("image", "wa.play.green");
    }else if(getPlayItemLength() <= 0){
        playstatus.setXmlParam("image", "wa.play.green");
    }else{
        playstatus.setXmlParam("image", "wa.play.red");
    }
    setState2();
}

setState2(){
    String currenttitle = System.strlower(System.getPlayItemDisplayTitle());
    
    if(System.strsearch(currenttitle, "[connecting") != -1){
		playstatus.setXmlParam("image", "wa.play.red");
	}
    if(System.strsearch(currenttitle, "[resolving hostname") != -1){
		playstatus.setXmlParam("image", "wa.play.red");
	}
    if(System.strsearch(currenttitle, "[http/1.1") != -1){
		playstatus.setXmlParam("image", "wa.play.red");
	}
    if(System.strsearch(currenttitle, "[buffer") != -1){
		playstatus.setXmlParam("image", "wa.play.red");
	}else{
        if(bitrateint == 0 || bitrateint == -1 && freqint == 0 || freqint == -1){
            playstatus.setXmlParam("image", "wa.play.red"); 
            setPlaysymbol.start();
        }
        if(bitrateint > 0 && freqint > 0){setPlaysymbol.start(); 
            playstatus.setXmlParam("image", "wa.play.green");
        }
    }
}