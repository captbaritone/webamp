//somehow a low cpu usage winamp 1.00 spectrum analyzer
//steal or something idc

#include "..\..\..\lib/std.mi"

Global AnimatedLayer band1, band2, band3, band4, band5, band6, band7, band8, band9, band10, band11, band12;
Global text banddebug;
Global Timer wa100analyzers;
Global float an1, an2, an3, an4, an5, an6, an7, an8, an9, an10, an11, an12;
Global float clip1, clip2, clip3, clip4, clip5, clip6, clip7, clip8, clip9, clip10, clip11, clip12;
Global int band1int, band2int, band3int, band4int, band5int, band6int, band7int, band8int, band9int, band10int, band11int, band12int;

Function setAmplitude();
Function anfo();
Function clip();

System.onScriptLoaded(){

    group visgroup = getScriptGroup();

    band1 = visgroup.findObject("band1");
    band2 = visgroup.findObject("band2");
    band3 = visgroup.findObject("band3");
    band4 = visgroup.findObject("band4");
    band5 = visgroup.findObject("band5");
    band6 = visgroup.findObject("band6");
    band7 = visgroup.findObject("band7");
    band8 = visgroup.findObject("band8");
    band9 = visgroup.findObject("band9");
    band10 = visgroup.findObject("band10");
    band11 = visgroup.findObject("band11");
    band12 = visgroup.findObject("band12");

    banddebug = visgroup.findObject("analyzerdebug");

    wa100analyzers = new Timer;
	wa100analyzers.setDelay(0);
    wa100analyzers.start();

    setAmplitude();

}

wa100analyzers.onTimer(){
    setAmplitude();
}

setAmplitude(){
    anfo();

    float divideby = 4.5;
    float dc = 340;

    band1int = ((getVisBand(0,0)+getVisBand(0,1)+getVisBand(0,2)+getVisBand(0,3)+getVisBand(0,4)+getVisBand(0,5))/divideby)*6;
    band2int = ((getVisBand(0,6)+getVisBand(0,7)+getVisBand(0,8)+getVisBand(0,9)+getVisBand(0,10)+getVisBand(0,11))/divideby)*4;
    band3int = ((getVisBand(0,12)+getVisBand(0,13)+getVisBand(0,14)+getVisBand(0,15)+getVisBand(0,16)+getVisBand(0,17))/divideby)*3.5;
    band4int = ((getVisBand(0,18)+getVisBand(0,19)+getVisBand(0,20)+getVisBand(0,21)+getVisBand(0,22)+getVisBand(0,23))/divideby)*3;
    band5int = ((getVisBand(0,24)+getVisBand(0,25)+getVisBand(0,26)+getVisBand(0,27)+getVisBand(0,28)+getVisBand(0,29))/divideby)*2;
    band6int = ((getVisBand(0,30)+getVisBand(0,31)+getVisBand(0,32)+getVisBand(0,33)+getVisBand(0,34)+getVisBand(0,35))/divideby)*2;
    band7int = ((getVisBand(0,36)+getVisBand(0,37)+getVisBand(0,38)+getVisBand(0,39)+getVisBand(0,40)+getVisBand(0,41))/divideby)*1.5;
    band8int = ((getVisBand(0,42)+getVisBand(0,43)+getVisBand(0,44)+getVisBand(0,45)+getVisBand(0,46)+getVisBand(0,47))/divideby)*1.5;
    band9int = ((getVisBand(0,48)+getVisBand(0,49)+getVisBand(0,50)+getVisBand(0,51)+getVisBand(0,52)+getVisBand(0,53))/divideby);
    band10int = ((getVisBand(0,54)+getVisBand(0,55)+getVisBand(0,56)+getVisBand(0,57)+getVisBand(0,58)+getVisBand(0,59))/divideby);
    band11int = ((getVisBand(0,60)+getVisBand(0,61)+getVisBand(0,62)+getVisBand(0,63)+getVisBand(0,64)+getVisBand(0,65))/divideby);
    band12int = ((getVisBand(0,66)+getVisBand(0,67)+getVisBand(0,68)+getVisBand(0,69)+getVisBand(0,70)+getVisBand(0,71))/divideby);

    band1.gotoFrame(an1*band1.getLength()/256);
    band2.gotoFrame(an2*band1.getLength()/256);
    band3.gotoFrame(an3*band1.getLength()/256);
    band4.gotoFrame(an4*band1.getLength()/256);
    band5.gotoFrame(an5*band1.getLength()/256);
    band6.gotoFrame(an6*band1.getLength()/256);
    band7.gotoFrame(an7*band1.getLength()/256);
    band8.gotoFrame(an8*band1.getLength()/256);
    band9.gotoFrame(an9*band1.getLength()/256);
    band10.gotoFrame(an10*band1.getLength()/256);
    band11.gotoFrame(an11*band1.getLength()/256);
    band12.gotoFrame(an12*band1.getLength()/256);
}

anfo(){
    float falloff = 26;

    //1,2
    if (band1int >= an1){
		an1 = band1int;
	}
    if(band1int >= 255){
        an1 = 255;
    }
	else{
		an1 -= falloff;
	}
	if (band2int >= an2){
		an2 = band2int;
	}
    if(band2int >= 255){
        an2 = 255;
    }
	else{
		an2 -= falloff;
	}

    //3,4
    if (band3int >= an3){
		an3 = band3int;
	}
    if(band3int >= 255){
        an3 = 255;
    }
	else{
		an3 -= falloff;
	}
	if (band4int >= an4){
		an4 = band4int;
	}
    if(band4int >= 255){
        an4 = 255;
    }
	else{
		an4 -= falloff;
	}

    //5,6
    if (band5int >= an5){
		an5 = band5int;
	}
    if(band5int >= 255){
        an5 = 255;
    }
	else{
		an5 -= falloff;
	}
	if (band6int >= an6){
		an6 = band6int;
	}
    if(band6int >= 255){
        an6 = 255;
    }
	else{
		an6 -= falloff;
	}

    //7,8
    if (band7int >= an7){
		an7 = band7int;
	}
    if(band7int >= 255){
        an7 = 255;
    }
	else{
		an7 -= falloff;
	}
	if (band8int >= an8){
		an8 = band8int;
	}
    if(band8int >= 255){
        an8 = 255;
    }
	else{
		an8 -= falloff;
	}

    //9,10
    if (band9int >= an9){
		an9 = band9int;
	}
    if(band9int >= 255){
        an9 = 255;
    }
	else{
		an9 -= falloff;
	}
	if (band10int >= an10){
		an10 = band10int;
	}
    if(band10int >= 255){
        an10 = 255;
    }
	else{
		an10 -= falloff;
	}

    //11,12
    if (band11int >= an11){
		an11 = band11int;
	}
    if(band11int >= 255){
        an11 = 255;
    }
	else{
		an11 -= falloff;
	}
	if (band12int >= an12){
		an12 = band12int;
	}
    if(band12int >= 255){
        an12 = 255;
    }
	else{
		an12 -= falloff;
	}
}