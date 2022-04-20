#include "..\..\..\lib/std.mi"

Global layer mono, stereo;
Global timer getchanneltimer;
Global int c;

Function int getChannels();

System.onScriptLoaded(){

    Group player = getScriptGroup();

    mono = player.findObject("mono");
    stereo = player.findObject("stereo");

    getchanneltimer = new Timer;
	getchanneltimer.setDelay(50);

    c = getChannels();

    if(c == 2){
        mono.setXmlParam("image", "player.status.mono.inactive");
        stereo.setXmlParam("image", "player.status.stereo.active");
    }else if(c == 1){
        mono.setXmlParam("image", "player.status.mono.active");
        stereo.setXmlParam("image", "player.status.stereo.inactive");
    }else if(c == -1){
        mono.setXmlParam("image", "player.status.mono.inactive");
        stereo.setXmlParam("image", "player.status.stereo.inactive");
    }
}

System.onResume()
{
	getchanneltimer.start();
}

System.onPlay()
{
	getchanneltimer.start();
    c = getChannels();
    if(c == 2){
        mono.setXmlParam("image", "player.status.mono.inactive");
        stereo.setXmlParam("image", "player.status.stereo.active");
    }else if(c == 1){
        mono.setXmlParam("image", "player.status.mono.active");
        stereo.setXmlParam("image", "player.status.stereo.inactive");
    }else if(c == -1){
        mono.setXmlParam("image", "player.status.mono.inactive");
        stereo.setXmlParam("image", "player.status.stereo.inactive");
    }
}

System.onTitleChange(String newtitle)
{
	getchanneltimer.start();
    c = getChannels();
    if(c == 2){
        mono.setXmlParam("image", "player.status.mono.inactive");
        stereo.setXmlParam("image", "player.status.stereo.active");
    }else if(c == 1){
        mono.setXmlParam("image", "player.status.mono.active");
        stereo.setXmlParam("image", "player.status.stereo.inactive");
    }else if(c == -1){
        mono.setXmlParam("image", "player.status.mono.inactive");
        stereo.setXmlParam("image", "player.status.stereo.inactive");
    }
}

System.onStop(){
    getchanneltimer.stop();
    mono.setXmlParam("image", "player.status.mono.inactive");
    stereo.setXmlParam("image", "player.status.stereo.inactive");
}

getchanneltimer.onTimer ()
{
    c = getChannels();
    if(c == 2){
        mono.setXmlParam("image", "player.status.mono.inactive");
        stereo.setXmlParam("image", "player.status.stereo.active");
    }else if(c == 1){
        mono.setXmlParam("image", "player.status.mono.active");
        stereo.setXmlParam("image", "player.status.stereo.inactive");
    }else if(c == -1){
        mono.setXmlParam("image", "player.status.mono.inactive");
        stereo.setXmlParam("image", "player.status.stereo.inactive");
    }
}

Int getChannels()
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