//Feel free to steal and/or modify.
//If you're using this from the SimpleTutorial skin, do kindly give credit to
//"Eris Lund (0x5066)" or "0x5066", or don't! I don't mind.
//This is now updated that enables it to be included within the
//skin.xml, taken from Ariszló's updated oldtimer.maki script
//Updated to include a simple menu - 22.03.2021
//This disables the shade specific checks

//If you include this, make sure your text object
//has "display="time"" (and for TTF "forcefixed="1"")
//or else you won't get the fancy formatting the
//engine applies for song timers

#include "..\..\..\lib/std.mi"

Global String currentpos, strremainder, currentpos_rev;
Global GuiObject DisplayTime/*DisplayTimeShade*/;
Global GuiObject TimerTrigger;
Global Timer timerSongTimer;
Global Timer timerSongTimerReverse;
Global Timer PauseBlinkPaused, PauseBlink, Clock;
Global int timermode;
Global int milliseconds;
Global int songlength;
Global int remainder;
Global int milliseconds_rev;
Global int i;

Global PopUpMenu clockMenu;

Function AreWePlaying();
Function InReverse();
Function TimeElapsedOrRemaining();
Function setTimer(int timermode);
Function StaticTime();
Function StaticTimeRemainder();
Function endless();
Function endlesspaused();
Function notendless();
Function notendlesspaused();
Function notendlesspaused_rev();
Function stopped();
Function initplaytimer();
Function playing();
Function playing_rev();
Function ItsBeenMuchTooLong();

System.onScriptLoaded() 
{
    //Group mainshade = getContainer("main").getLayout("shade");
    /* Replace "timer" with "shade.time" for Winamp Classic Modern */
    //DisplayTimeShade = mainshade.findObject("timer");

    Group mainnormal = getScriptGroup();
    /* Replace "timer" with "display.time" for Winamp Classic Modern */
    DisplayTime = mainnormal.findObject("timer");
    TimerTrigger = mainnormal.findObject("TimerTrigger");
    //The above was taken from Ariszló's updated oldtimer.maki script
    //Allows it to be included in the skin.xml file of the skin

    //ints for playback
    milliseconds = System.getPosition();
    songlength = StringtoInteger(System.getPlayItemMetaDataString("length"));
    remainder = songlength - milliseconds;
    milliseconds_rev = milliseconds-songlength;

    //strings for playback
    currentpos = System.integerToTime(milliseconds);
    strremainder = System.integerToTime(remainder);
    currentpos_rev = System.integerToTime(milliseconds-songlength);

    timerSongTimer = new Timer;
	timerSongTimer.setDelay(50);
    timerSongTimerReverse = new Timer;
    timerSongTimerReverse.setDelay(50);
    PauseBlink = new Timer;
    PauseBlink.setDelay(50);
    PauseBlinkPaused = new Timer;
    PauseBlinkPaused.setDelay(50);
    Clock = new Timer;
    Clock.setDelay(1000);
    Clock.start();

    setTimer(getPrivateInt(getSkinName(), "TimerElapsedRemaining", 1));
    TimeElapsedOrRemaining();
}

TimeElapsedOrRemaining()
{
    int timermode = getPrivateInt(getSkinName(), "TimerElapsedRemaining", 1);
    setTimer(timermode);

    if(timermode == 1){ //Time elapsed
    TimerTrigger.setXmlParam("tooltip", "Time Display (click to toggle elapsed/remaining)");
    //DisplayTimeShade.setXmlParam("tooltip", "Time Elapsed (click to toggle remaining)");
        if(songlength <= 0){ //If below 0, then run StaticTime()
            StaticTime();
        }
        else{ //If not, also run StaticTime(), reason why is below
            StaticTime(); //this actually needs to exist specifically for the pause state, dont ask me why
        }
    }

    if (timermode == 2){ //Time remaining
    //DisplayTime.setXmlParam("tooltip", "Time Remaining (click to toggle elapsed)");
    //DisplayTimeShade.setXmlParam("tooltip", "Time Remaining (click to toggle elapsed)");
        if(songlength <= 0){
            StaticTime();
        }
    else{
        StaticTimeRemainder(); //same
    }

}
    if (getStatus() == 0){ //Stopped
            stopped();
    }
}


Clock.onTimer(){
    if(i >= 1){
        i = 0;
    }else{
        i++;
    }
}

PauseBlinkPaused.onTimer(){ //Remainder
    if(i >= 1){
        StaticTimeRemainder();
    }else{
        timerSongTimer.stop();
        DisplayTime.setXmlParam("text", "   :  ");
        //DisplayTimeShade.setXmlParam("text", "   :  ");
    }
}

PauseBlink.onTimer(){ //Elapsed
    if(i >= 1){
        StaticTime();
    }else{
        timerSongTimer.stop();
        DisplayTime.setXmlParam("text", "  :  ");
        //DisplayTimeShade.setXmlParam("text", "  :  ");
    }
}

TimerTrigger.onRightButtonUp (int x, int y){
    int timermode = getPrivateInt(getSkinName(), "TimerElapsedRemaining", 1);

    clockMenu = new PopUpMenu;

	clockMenu.addcommand("Time elapsed", 1, timermode == 1,0);
	clockMenu.addcommand("Time remaining", 2, timermode == 2,0);

	timermode = clockMenu.popAtMouse();


	setTimer(timermode);
	complete;
}
/*
DisplayTimeShade.onRightButtonUp (int x, int y){
    int timermode = getPrivateInt(getSkinName(), "TimerElapsedRemaining", 1);

    clockMenu = new PopUpMenu;

	clockMenu.addcommand("Time elapsed", 1, timermode == 1,0);
	clockMenu.addcommand("Time remaining", 2, timermode == 2,0);

	timermode = clockMenu.popAtMouse();

	setTimer(timermode);
	complete;
}
*/
TimerTrigger.onLeftButtonDown(int x, int y)
{
    int timermode = getPrivateInt(getSkinName(), "TimerElapsedRemaining", 1);

    timermode++;

    if (timermode == 3){
        timermode = 1;
    }
    setTimer(timermode);
    complete;
}

//DisplayTimeShade.onLeftButtonDown(int x, int y)
//{
//    int timermode = getPrivateInt(getSkinName(), "TimerElapsedRemaining", 1);
//
//    timermode++;
//
//    if (timermode == 3){
//        timermode = 1;
//    }
//    setTimer(timermode);
//    complete;
//}

//Here we run these checks every time a playback related action happens
//It's not enough to check on title change
System.onPlay(){
    int timermode = getPrivateInt(getSkinName(), "TimerElapsedRemaining", 1);

    TimeElapsedOrRemaining();

    if (timermode == 2){
        if(songlength <= 0){
            endless();
//We do this to check if what we're currently playing is a stream/endless VGM track
//as trying to display the time remaining is pointless and only adds a "-", so we
//force to start the timer for the "Time Elapsed" mode if that is the case
        }
        else{
            notendless();
//otherwise, display the time remaining
        }
    }
}

System.onPause(){
    int timermode = getPrivateInt(getSkinName(), "TimerElapsedRemaining", 1);

    TimeElapsedOrRemaining();
    if (timermode == 2){
        if(songlength <= 0){
            endlesspaused();
        }
        else{
            notendlesspaused_rev();
        }
    }
}

System.onResume(){
    int timermode = getPrivateInt(getSkinName(), "TimerElapsedRemaining", 1);

    TimeElapsedOrRemaining();
    if (timermode == 2){
        if(songlength <= 0){
            endless();
        }
        else{
            notendless();
        }
    }
}

System.onTitleChange(String info){
    int timermode = getPrivateInt(getSkinName(), "TimerElapsedRemaining", 1);

    TimeElapsedOrRemaining();
    if (timermode == 2){
        if(songlength <= 0){
            endless();
        }
        else{
            notendless();
        }
    }
}

//We stop every timer and instead display Winamp Modern's default of "00:00"
System.onStop(){
    TimeElapsedOrRemaining();
    stopped();
}

StaticTime(){ //Needed since the timer has a delay of 50ms and we don't want any odd flashing on loading
    playing();
}

StaticTimeRemainder(){ //Needed since the timer has a delay of 50ms and we don't want any odd flashing on loading
    milliseconds = System.getPosition();
    songlength = StringtoInteger(System.getPlayItemMetaDataString("length"));

//The purpose of this check is to ensure we properly place
//a "0" if we happen to be below 600000ms, or 10 minutes
//If we are above 600000ms or 10 minutes, don't append a "0"
    playing_rev();
//In case of plugins providing a way to play outside the song's original length
//and the user just so happened to have time remaining enabled, we want to
//ensure they still get the proper time position displayed, even if it's irrelevant.
//Winamp 2/Winamp Classic do this.
    if(milliseconds > songlength){
        ItsBeenMuchTooLong();
    }
}

timerSongTimer.onTimer(){
    currentpos = System.integerToTime(milliseconds);

//The purpose of this check is to ensure we properly place
//a "0" if we happen to be below 600000ms, or 10 minutes
//If we are above 600000ms or 10 minutes, don't append a "0"
    playing();
}

timerSongTimerReverse.onTimer(){
    milliseconds = System.getPosition();
    songlength = StringtoInteger(System.getPlayItemMetaDataString("length"));

//The purpose of this check is to ensure we properly place
//a "0" if we happen to be below 600000ms, or 10 minutes
//If we are above 600000ms or 10 minutes, don't append a "0"
    playing_rev();
//The purpose of this check is to ensure we properly place
//a "0" if we happen to be below 600000ms, or 10 minutes
//If we are above 600000ms or 10 minutes, don't append a "0"
    if(milliseconds > songlength){
        ItsBeenMuchTooLong();
    }
}

AreWePlaying(){
//Just some sanity checks to ensure we're in the right modes
    TimerTrigger.setXmlParam("tooltip", "Time Display (click to toggle elapsed/remaining)");
    //DisplayTimeShade.setXmlParam("tooltip", "Time Elapsed (click to toggle remaining)");

    if (getStatus() == -1){ //Paused
        notendlesspaused();
	}
    else if (getStatus() == 0){ //Stopped
        stopped();
	}
	else if (getStatus() == 1){ //Playing
        initplaytimer();  
	}
}

InReverse(){
//Just some sanity checks to ensure we're in the right modes
    songlength = StringtoInteger(System.getPlayItemMetaDataString("length"));
//In case of streams or VGM formats with endless playback
//We don't want the user to still be able to toggle
//between time remaining or elapsed, so we force
//the elapsed mode to run
//This has now been actually fixed
    TimerTrigger.setXmlParam("tooltip", "Time Display (click to toggle elapsed/remaining)");
    //DisplayTimeShade.setXmlParam("tooltip", "Time Remaining (click to toggle elapsed)");

    if(songlength <= 0){
        if (getStatus() == -1){ //Paused
            endlesspaused();
        }
    else if (getStatus() == 0){ //Stopped
            stopped();
        }
	    else if (getStatus() == 1){ //Playing
            endless(); 
        }
    }
    else{
        if (getStatus() == -1){ //Paused
            notendlesspaused_rev();    
		}
    else if (getStatus() == 0){ //Stopped
            stopped();
		}
	else if (getStatus() == 1){ //Playing
            notendless();  
        }
    }
}

setTimer(int timermode){
    if(timermode>=1 && timermode<=2){ //i fucking hate building menus
        if (timermode == 1){
            AreWePlaying();
        }
        else if (timermode == 2){
            InReverse();
        }
        setPrivateInt(getSkinName(), "TimerElapsedRemaining", timermode);
    }
}

endless(){ //Playing for endless stuff
    StaticTime();
    timerSongTimerReverse.stop();
    PauseBlink.stop();
    PauseBlinkPaused.stop();
    timerSongTimer.start();
}

notendless(){ //Playing for non endless stuff
    StaticTimeRemainder();
    timerSongTimer.stop();
    PauseBlink.stop();
    PauseBlinkPaused.stop();
    timerSongTimerReverse.start();
}

endlesspaused(){ //Paused for endless stuff
    timerSongTimerReverse.stop();
    timerSongTimer.stop();
    PauseBlinkPaused.stop();
    PauseBlink.start();
}

notendlesspaused(){ //Paused for non endless stuff
    timerSongTimer.stop();
    timerSongTimerReverse.stop();
    PauseBlinkPaused.stop();
    PauseBlink.start();
}

notendlesspaused_rev(){ //Paused for non endless stuff, time remaining
    timerSongTimer.stop();
    timerSongTimerReverse.stop();
    PauseBlink.stop();
    PauseBlinkPaused.start();
}

stopped(){
    timerSongTimer.stop();
    timerSongTimerReverse.stop();
    PauseBlink.stop();
    PauseBlinkPaused.stop();
    DisplayTime.setXmlParam("text", "  :  ");
    //DisplayTimeShade.setXmlParam("text", "00:00");
}

playing(){
    milliseconds = System.getPosition();
    currentpos = System.integerToTime(milliseconds);

    if(milliseconds < 600000){
        DisplayTime.setXmlParam("text", "0"+currentpos);
        //DisplayTimeShade.setXmlParam("text", "0"+currentpos);
    }
    else{
        DisplayTime.setXmlParam("text", currentpos);
        //DisplayTimeShade.setXmlParam("text", currentpos);
    }
}

playing_rev(){
    milliseconds = System.getPosition();
    songlength = StringtoInteger(System.getPlayItemMetaDataString("length"));
    remainder = songlength - milliseconds;
    milliseconds_rev = milliseconds-songlength;
    strremainder = System.integerToTime(remainder);
    currentpos_rev = System.integerToTime(milliseconds-songlength);

    if(remainder < 600000){
        DisplayTime.setXmlParam("text", "-0"+strremainder);
        //DisplayTimeShade.setXmlParam("text", "-0"+strremainder);
    }
    else{
        DisplayTime.setXmlParam("text", "-"+strremainder);
        //DisplayTimeShade.setXmlParam("text", "-"+strremainder);
    }
}

ItsBeenMuchTooLong(){ //I feel it coming on, the feeling's gettin' strong
    milliseconds = System.getPosition();
    songlength = StringtoInteger(System.getPlayItemMetaDataString("length"));
    milliseconds_rev = milliseconds-songlength;

    if(milliseconds_rev < 600000){
        DisplayTime.setXmlParam("text", "-0"+currentpos_rev);
        //DisplayTimeShade.setXmlParam("text", "-0"+currentpos_rev);
    }
    else{
        DisplayTime.setXmlParam("text", "-"+currentpos_rev);
        //DisplayTimeShade.setXmlParam("text", "-"+currentpos_rev);
    }
}

initplaytimer(){
    PauseBlink.stop();
    PauseBlinkPaused.stop();
    timerSongTimerReverse.stop();
    StaticTime();
    timerSongTimer.start();   
}