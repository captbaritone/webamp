#include "..\..\..\lib/std.mi"

Global layer playstatus;
Global timer getchanneltimer;

Function setState();

System.onScriptLoaded(){

    Group player = getScriptGroup();

    playstatus = player.findObject("playbackstatus");

    getchanneltimer = new Timer;
	getchanneltimer.setDelay(50);

    setState();

    if(getStatus() == 1){
        playstatus.setXmlParam("visible", "1");
    }else if(getStatus() == -1){
        playstatus.setXmlParam("visible", "0");
    }else if(getStatus() == 0){
        playstatus.setXmlParam("visible", "0");
        playstatus.setXmlParam("image", "wa.play.green");
    }
}

System.onPause(){
    playstatus.setXmlParam("visible", "0");
}

System.onResume()
{
	getchanneltimer.start();
    playstatus.setXmlParam("visible", "1");
}

System.onPlay()
{
	getchanneltimer.start();
    playstatus.setXmlParam("visible", "1");
}

System.onTitleChange(String newtitle)
{
    if(getStatus() == 1){
        playstatus.setXmlParam("visible", "1");
        getchanneltimer.start();
    }else if(getStatus() == -1){
        playstatus.setXmlParam("visible", "0");
        getchanneltimer.stop();
    }else if(getStatus() == 0){
        getchanneltimer.stop();
        playstatus.setXmlParam("visible", "0");
        playstatus.setXmlParam("image", "wa.play.green");
    }
}

System.onStop(){
    getchanneltimer.stop();
    playstatus.setXmlParam("visible", "0");
    playstatus.setXmlParam("image", "wa.play.green");
}

getchanneltimer.onTimer()
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
}
