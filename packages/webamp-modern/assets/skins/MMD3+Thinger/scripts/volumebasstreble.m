//--------------------------------------------------------------------
// Animated Volume/Treble/Bass knobs
//--------------------------------------------------------------------
// volumebasstreble.m
//--------------------------------------------------------------------
// - Volume
// - Treble
// - Bass
// - Knob-LEDs
//--------------------------------------------------------------------
// Script by:		Barti Bartman alias Sven Kistner for MMD3
// Last Modified:	26.11.2002
//--------------------------------------------------------------------
//
// BIG THANKS GOES TO:
// ThePlague.............for the great ideas and inspirations
// Dennis Ostermann......for code parts of the new script
//
//--------------------------------------------------------------------
// Feel free to use parts of this script in your own projects
// I know the code looks a litle bit strange. Sorry for that...
// ...I am more a graphic artist than a coder...but it works :)
//--------------------------------------------------------------------

#include "../../../lib/std.mi"

Function updateVolume(int v);
Function initVolume();
Function updateTreble(int v);
Function updateTrebleKnob(int v);
Function initTreble();
Function initTicker();
Function int getTreble();
Function SetTreble(float v);
Function SetBass(float v);
Function updateBass(int v);
Function updateBassKnob(int v);
Function initBass();
Function int getBass();

Global AnimatedLayer Bass, Treble, Volume, Volume2,VolumeLED, BassLED, TrebleLED;
Global Layer BassInfo, TrebleInfo, VolumeInfo, VolumeInfo2;
Global Boolean InUse=0;
Global Timer SongTickerTimer;
Global Layout dummynormal;
Global group mainnormal;
Global Text SongTicker;
Global Slider HiddenVolume;
Global Int VolChanging, VolFrames;
Global Int TrebleChanging, TrebFrames, TickerExist;
Global Int BassChanging, BassFrames;
Global Int VolumeIsPlaying,TrebleIsPlaying,BassIsPlaying,MouseIsDown,lmx,lmy,specialTreble,specialBass;
Global Timer VolKnobTimer,Vol2KnobTimer,BassKnobTimer,TrebleKnobTimer;
Global Map bassMap, trebleMap, volMap,volMap2;
Global int WinX,WinY;


System.onScriptLoaded() {

	dummynormal = System.getContainer("main").getLayout("normal");
	mainnormal = dummynormal.getObject("main.mmd3");

	Volume = mainnormal.getObject("VolumeAnim");
	VolumeLED = mainnormal.getObject("VolumeAnimLED");
	Volume2 = mainnormal.getObject("VolumeAnim2");

	VolumeInfo = mainnormal.getObject("volumeaniminfo");

	VolumeInfo2 = mainnormal.getObject("volumeaniminfo2");
	HiddenVolume = mainnormal.getObject("HiddenVolume");

	Bass = mainnormal.getObject("BassAnim");
	BassLED = mainnormal.getObject("BassAnimLED");
	BassInfo = mainnormal.getObject("bassaniminfo");

	Treble = mainnormal.getObject("TrebleAnim");
	TrebleLED = mainnormal.getObject("TrebleAnimLED");
	TrebleInfo = mainnormal.getObject("trebleaniminfo");

	VolumeIsPlaying=0;
	MouseIsDown=0;
	specialTreble=0;

	volMap = new Map;
	volMap.loadMap("player.map.volume");
	volMap2 = new Map;
	volMap2.loadMap("player.map.volume2");
	bassMap = new Map;
	bassMap.loadMap("player.map.bass");
	trebleMap = new Map;
	trebleMap.loadMap("player.map.treble");

	VolKnobTimer = new Timer;
	VolKnobTimer.setDelay(10);

	Vol2KnobTimer = new Timer;
	Vol2KnobTimer.setDelay(10);

	BassKnobTimer = new Timer;
	BassKnobTimer.setDelay(10);

	TrebleKnobTimer = new Timer;
	TrebleKnobTimer.setDelay(10);

	initVolume();
	initBass();
	initTreble();

}


initTicker() {
	SongTicker = mainnormal.getObject("songticker");
	SongTickerTimer = new Timer;
	SongTickerTimer.setDelay(1000);
}

SongTickerTimer.onTimer() {
	SongTicker.setText("");
	SongTickerTimer.stop();
}

initVolume() {

	VolumeInfo.setAlpha(0);
	VolumeInfo2.setAlpha(0);

	VolChanging = 0;
	VolFrames = Volume.getLength();
	VolFrames = VolFrames - 1;
	TickerExist = VolumeInfo.getTop();

	float u;
	u = System.getVolume();
	u = u / 255;
	int k = u * VolFrames;
	Volume.gotoFrame(k);
	Volume2.gotoFrame(k);

	if (TickerExist) initTicker();
}



//------------------------------------------------------------
// Volume functions
//------------------------------------------------------------
	Volume.onLeftButtonDown(int x, int y) {
		VolChanging = 1;
		MouseIsDown = 1;

		lmx=getMousePosX();
		lmy=getMousePosY();

		WinX=getMousePosX()-x+Volume.getLeft()+(Volume.getWidth()/2);
		WinY=getMousePosY()-y+Volume.getTop()+(Volume.getHeight()/2);

		x = x - Volume.getLeft();
		y = y - Volume.getTop();

		if (volMap.inRegion(x, y)) {
			float v = volMap.getValue(x, y);

			if (v>252) v=255;
			float k = v / 255;
			int g = k * VolFrames;

			Volume.setStartFrame( Volume.getCurFrame() );
			Volume2.setStartFrame( Volume2.getCurFrame() );
			Volume.setEndFrame(g);
			Volume2.setEndFrame(g);
			Volume.setSpeed(40);
			Volume2.setSpeed(40);
			VolumeIsPlaying=1;
			Volume.play();
			Volume2.play();
		}

		VolKnobTimer.start();
	}



	VolKnobTimer.onTimer()
	{
		float dx,dy,dWinX,dWinY,Temp,AniVol,Vol;
		int Gate,Gate2;
		int x=getMousePosX();
		int y=getMousePosY();
		dx=x;
		dy=y;
		dWinx=WinX;
		dWinY=WinY;

		if ( (x-lmx)>2 || (x-lmx)<-2 || (y-lmy)>2 || (y-lmy)<-2 ) {

			if (VolumeIsPlaying==1) {
				Volume.stop();
				Volume2.stop();
				VolumeIsPlaying=0;
			}

			if ((WinY<y) && (WinX>x) )
			{
				if (Gate==0)
				{
					Temp=((dWinX-dx)/((dWinY-dy)*-1));
					Vol=(atan(Temp)-0.523598775)*48.89239852;
					Gate2=1;
				}
				else Vol=255;
			}

			else if  ((WinY>y) && (WinX>x))
			{
				Temp=(dWinY-dy)/(dWinX-dx);
				Vol=51.2+atan(Temp)*48.89239852;
				Gate=0;
				Gate2=0;

			}

			else if  ((WinY>y) && (WinX<x))
			{
				Temp=((dWinX-dx)*-1)/(dWinY-dy);
				Vol=128.0+atan(Temp)*48.89239852;
				Gate=0;
				Gate2=0;

			}

			else if  ((WinY<y) && (WinX<x) )
			{
				if (Gate2==0)
				{
					Temp=((dWinY-dy)*-1)/((dWinX-dx)*-1);
					Vol=204.8+atan(Temp)*48.89239852;
					Gate=1;
				}
				else Vol=0;
			}

			UpdateVolume(Vol);
		}
	}


	Volume.onLeftButtonUp(int x, int y)
	{
		VolKnobTimer.stop();
		SongTickerTimer.start();
		VolChanging=0;
		MouseIsDown = 0;
	}


	Vol2KnobTimer.onTimer()
	{
		float Vol;
		float x=getMousePosX();
		float l=Volume2.getWidth();

		if (x!=lmx) {

			if (VolumeIsPlaying==1) {
				Volume.stop();
				Volume2.stop();
				VolumeIsPlaying=0;
			}

			Vol = (x - WinX) * (255.0 / l);
			UpdateVolume(Vol);
		}
	}

	Volume2.onLeftButtonDown(int x, int y) {
		VolChanging = 1;
		MouseIsDown = 1;

		lmx=getMousePosX();
		lmy=getMousePosY();

		WinX=getMousePosX()-x+Volume2.getLeft();

		x = x - Volume2.getLeft();
		y = y - Volume2.getTop();

		if (volMap2.inRegion(x, y)) {
			float v = volMap2.getValue(x, y);
			if (v>252) v=255;
			float k = v / 255;
			int g = k * VolFrames;

			Volume.setStartFrame( Volume.getCurFrame() );
			Volume2.setStartFrame( Volume2.getCurFrame() );
			Volume.setEndFrame(g);
			Volume2.setEndFrame(g);
			Volume.setSpeed(40);
			Volume2.setSpeed(40);
			VolumeIsPlaying=1;
			Volume.play();
			Volume2.play();
		}


		Vol2KnobTimer.start();
	}


	Volume2.onLeftButtonUp(int x, int y)
	{
		Vol2KnobTimer.stop();
		SongTickerTimer.start();
		VolChanging=0;
		MouseIsDown = 0;
	}


	Volume.onFrame(int vf) {

		VolumeLED.gotoFrame(vf);

		if (VolumeIsPlaying) {
			int v=11.6*vf;
			System.setVolume(v);

			if (MouseIsDown) {
				float k = v / 255;
				int p = k * 100;
				SongTickerTimer.stop();
				SongTickerTimer.start();
				SongTicker.setAlternateText("VOLUME: " + System.integerToString(p) + "%");
			}
		}
	}


	Volume.onStop() {
		VolumeIsPlaying=0;
	}


	updateVolume(float v) {
		if (v < 0) v=0;
		if (v >255) v=255;

		float k = v / 255;
		int g = k * VolFrames;
		if ( !Volume.isPlaying() ) {
			Volume.gotoFrame(g);
			Volume2.gotoFrame(g);
		}

		System.setVolume(v);

		int p = k * 100;
		SongTickerTimer.stop();
		SongTickerTimer.start();
		SongTicker.setAlternateText("VOLUME: " + System.integerToString(p) + "%");
	}


	HiddenVolume.onPostedPosition(int p) {
		if (!VolChanging) {

			Float f = getVolume();
			Float sf = f/2.55;
			f = f * VolFrames;
			f = f / 255;

			if ( !Volume.isPlaying() ) {
				Volume.gotoFrame(f);
				Volume2.gotoFrame(f);
			}

			SongTickerTimer.stop();
			SongTickerTimer.start();
			SongTicker.setAlternateText("VOLUME: " + System.integerToString(sf) + "%");

		}
	}
//------------------------------------------------------------
// End of Volume functions
//------------------------------------------------------------






//------------------------------------------------------------
// Treble functions
//------------------------------------------------------------
	initTreble() {
		TrebleInfo.setAlpha(0);
		TrebleChanging = 0;

		TrebFrames = Treble.getLength();
		TrebFrames = TrebFrames - 1;
		float u;
		u = getTreble();
		u = u / 255;
		int k = u * TrebFrames;
		Treble.gotoFrame(k);
	}

	TrebleKnobTimer.onTimer()
	{
		float dx,dy,dWinX,dWinY,Temp,Treb;
		int Gate,Gate2;
		int x=getMousePosX();
		int y=getMousePosY();
		dx=x;
		dy=y;
		dWinx=WinX;
		dWinY=WinY;


		if ( (x-lmx)>2 || (x-lmx)<-2 || (y-lmy)>2 || (y-lmy)<-2 ) {

			if (TrebleIsPlaying==1) {
				Treble.stop();
				TrebleIsPlaying=0;
			}

			if ((WinY<y) && (WinX>x) )
			{
				if (Gate==0)
				{
					Temp=((dWinX-dx)/((dWinY-dy)*-1));
					Treb=(atan(Temp)-0.523598775)*48.89239852;		// 1/6 PI ~ 0.523598775
					Gate2=1;										// 256 : 1/2/3 PI ~ 48.89239852
				}
				else Treb=255;



			}
			else if  ((WinY>y) && (WinX>x))
			{
				Temp=(dWinY-dy)/(dWinX-dx);
				Treb=51.2+atan(Temp)*48.89239852;
				Gate=0;
				Gate2=0;

			}
			else if  ((WinY>y) && (WinX<x))
			{
				Temp=((dWinX-dx)*-1)/(dWinY-dy);
				Treb=128.0+atan(Temp)*48.89239852;
				Gate=0;
				Gate2=0;

			}
			else if  ((WinY<y) && (WinX<x) )
			{
				if (Gate2==0)
				{
					Temp=((dWinY-dy)*-1)/((dWinX-dx)*-1);
					Treb=204.8+atan(Temp)*48.89239852;
					Gate=1;
				}
				else Treb=0;


			}

			UpdateTreble(Treb);
			UpdateTrebleKnob(Treb);
		}

	}


	Treble.onLeftButtonDown(int x, int y) {
		trebleChanging = 1;
		MouseIsDown = 1;
		specialTreble=0;

		WinX=getMousePosX()-x+Treble.getLeft()+(Treble.getWidth()/2);
		WinY=getMousePosY()-y+Treble.getTop()+(Treble.getHeight()/2);

		lmx=getMousePosX();
		lmy=getMousePosY();

		x = x - Treble.getLeft();
		y = y - Treble.getTop();

		if (trebleMap.inRegion(x, y)) {
			float v = trebleMap.getValue(x, y);

			if (v>252) v=255;
			float k = v / 255;
			int g = k * TrebFrames;

			Treble.setStartFrame( Treble.getCurFrame() );
			Treble.setEndFrame(g);
			Treble.setSpeed(40);
			TrebleIsPlaying=1;
			Treble.play();
		}
		TrebleKnobTimer.start();
	}

	Treble.onLeftButtonUp(int x, int y) {
		TrebleKnobTimer.stop();
		SongTickerTimer.start();
		trebleChanging=0;
		MouseIsDown = 0;
	}


	Treble.onFrame(int vf) {

		TrebleLED.gotoframe(vf);

		int v=11.6*vf;

		if (TrebleIsPlaying) {
			if (!specialTreble) SetTreble(v);
		}

		float k = v / 255;
		int p = k * 100-50;
		string vz="";
		if (p>0) vz="+";
		SongTickerTimer.stop();
		SongTicker.setAlternateText("TREBLE: " + vz + System.integerToString(p) + "%");
		SongTickerTimer.start();
	}


	Treble.onStop() {
		TrebleIsPlaying=0;
		specialTreble=0;
	}


	updateTreble(float v) {
		if (v < 0) v=0;
		if (v >255) v=255;
		float k = v / 255;
		int g = k * TrebFrames;
		if ( !Treble.isPlaying() ) {
			Treble.gotoFrame(g);
		}

		SetTreble(v);

	}


	SetTreble(float v) {
		v -=127;

		setEq(1);

		int move;
		InUse = 1;
		for(int i=5; i<10; i++) {
			move = v*1.27/(10-i);
			setEqBand(i, move);
		}
		InUse = 0;

	}

	updateTrebleKnob(float v) {
		if (v < 0) v=0;
		if (v >255) v=255;
		trebleChanging = 1;
		specialTreble = 1;
		float k = v / 255;
		int g = k * TrebFrames;

		Treble.setStartFrame( Treble.getCurFrame() );
		Treble.setEndFrame(g);
		Treble.setSpeed(40);
		TrebleIsPlaying=1;
		Treble.play();
	}


	getTreble() {

		float average=0;

		for(int i=5; i<10; i++) average += ( (getEqBand(i)+127)*(i-4)*(i-4)*(i-4)  );
		average /= 198;

		int rTreble = average;

		if (rTreble < 0) rTreble=0;
		if (rTreble >255) rTreble=255;

		return rTreble;
	}



//------------------------------------------------------------
// End of Treble functions
//------------------------------------------------------------





//------------------------------------------------------------
// Bass functions
//------------------------------------------------------------

	initBass() {

		BassInfo.setAlpha(0);

		BassChanging = 0;
		BassFrames = Bass.getLength();
		BassFrames = BassFrames - 1;

		float u;
		u = getBass();
		u = u / 255;
		int k = u * BassFrames;
		Bass.gotoFrame(k);


	}


	BassKnobTimer.onTimer()
	{
		float dx,dy,dWinX,dWinY,Temp,theBass;
		int Gate,Gate2;
		int x=getMousePosX();
		int y=getMousePosY();
		dx=x;
		dy=y;
		dWinx=WinX;
		dWinY=WinY;

		if ( (x-lmx)>2 || (x-lmx)<-2 || (y-lmy)>2 || (y-lmy)<-2 ) {

			if (BassIsPlaying==1) {
				Bass.stop();
				BassIsPlaying=0;
			}


			if ((WinY<y) && (WinX>x) )
			{
				if (Gate==0)
				{
					Temp=((dWinX-dx)/((dWinY-dy)*-1));
					theBass=(atan(Temp)-0.523598775)*48.89239852;		// 1/6 PI ~ 0.523598775
					Gate2=1;										// 256 : 1/2/3 PI ~ 48.89239852
				}
				else theBass=255;



			}
			else if  ((WinY>y) && (WinX>x))
			{
				Temp=(dWinY-dy)/(dWinX-dx);
				theBass=51.2+atan(Temp)*48.89239852;
				Gate=0;
				Gate2=0;

			}
			else if  ((WinY>y) && (WinX<x))
			{
				Temp=((dWinX-dx)*-1)/(dWinY-dy);
				theBass=128.0+atan(Temp)*48.89239852;
				Gate=0;
				Gate2=0;

			}
			else if  ((WinY<y) && (WinX<x) )
			{
				if (Gate2==0)
				{
					Temp=((dWinY-dy)*-1)/((dWinX-dx)*-1);
					theBass=204.8+atan(Temp)*48.89239852;
					Gate=1;
				}
				else theBass=0;


			}

			UpdateBass(theBass);
			UpdateBassKnob(theBass);
		}

	}

	Bass.onLeftButtonDown(int x, int y) {
		BassChanging = 1;
		MouseIsDown = 1;
		specialBass=0;

		WinX=getMousePosX()-x+Bass.getLeft()+(Bass.getWidth()/2);
		WinY=getMousePosY()-y+Bass.getTop()+(Bass.getHeight()/2);

		lmx=getMousePosX();
		lmy=getMousePosY();

		x = x - Bass.getLeft();
		y = y - Bass.getTop();

		if (BassMap.inRegion(x, y)) {
			float v = BassMap.getValue(x, y);

			if (v>252) v=255;
			float k = v / 255;
			int g = k * BassFrames;

			Bass.setStartFrame( Bass.getCurFrame() );
			Bass.setEndFrame(g);
			Bass.setSpeed(40);
			BassIsPlaying=1;
			Bass.play();
		}
		BassKnobTimer.start();
	}

	Bass.onLeftButtonUp(int x, int y) {
		BassChanging=0;
		BassKnobTimer.stop();
		SongTickerTimer.start();
		MouseIsDown = 0;
	}



	Bass.onFrame(int vf) {
		BassLED.gotoframe(vf);

		int v=11.6*vf;

		if (BassIsPlaying) {
			if (!specialBass) SetBass(v);
		}

		float k = v / 255;
		int p = k * 100-50;
		string vz="";
		if (p>0) vz="+";
		SongTickerTimer.stop();
		SongTicker.setAlternateText("Bass: " + vz + System.integerToString(p) + "%");
		SongTickerTimer.start();
	}


	Bass.onStop() {
		BassIsPlaying=0;
		specialBass=0;
	}


	updateBass(float v) {
		if (v < 0) v=0;
		if (v >255) v=255;
		float k = v / 255;
		int g = k * BassFrames;
		if ( !Bass.isPlaying() ) {
			Bass.gotoFrame(g);
		}

		SetBass(v);

		int p = k * 100-50;

	}


	SetBass(float v) {
		v -=127;

		setEq(1);

		int move;
		InUse = 1;
		for(int i=0; i<5; i++) {
			move = v*1.27/(i+1);
			setEqBand(i, move);
		}
		InUse = 0;

	}

	updateBassKnob(float v) {
		if (v < 0) v=0;
		if (v >255) v=255;

		BassChanging = 1;
		specialBass = 1;
		float k = v / 255;
		int g = k * BassFrames;

		Bass.setStartFrame( Bass.getCurFrame() );
		Bass.setEndFrame(g);
		Bass.setSpeed(40);
		BassIsPlaying=1;
		Bass.play();
	}


	getBass() {

		float average=0;

		for(int i=0; i<5; i++) average += ( (getEqBand(i)+127)*(5-i)*(5-i)*(5-i)  );
		average /= 198;

		int rBass = average;

		if (rBass < 0) rBass=0;
		if (rBass >255) rBass=255;

		return rBass;
	}

//------------------------------------------------------------
// End of Bass functions
//------------------------------------------------------------


System.onEqBandChanged(int band, int newvalue) {

	if(!InUse) {

		if (band<5) {
			int rb=getBass();
			updateBassKnob(rb);
		} else {

			int rb=getTreble();
			updateTrebleKnob(rb);
		}
	}
}