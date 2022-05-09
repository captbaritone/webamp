#include "..\..\..\..\..\..\lib/std.mi"

Global AnimatedLayer SliderBG1, SliderBG2, SliderBG3;
Global Slider WasabiSlider;

Global Timer PokeWasabiSlider;

Function setSliderBackground(int volValue);

System.onScriptLoaded(){

    Group player = getScriptGroup();
    SliderBG1 = player.getObject("slider.background1"); //28 frames
    SliderBG2 = player.getObject("slider.background2");
    SliderBG3 = player.getObject("slider.background3");
    WasabiSlider = player.getObject("slider.button");
    setSliderBackground(WasabiSlider.getPosition());

    PokeWasabiSlider = new Timer;
	PokeWasabiSlider.setDelay(50);
    PokeWasabiSlider.start();
}

PokeWasabiSlider.onTimer(){
    setSliderBackground(WasabiSlider.getPosition());
}

setSliderBackground(int Value) {
	int f = (Value * (SliderBG1.getLength()-1)) / 8415; //8415? sure, why not, i'll take that, i guess
    if (Value > 0) {
		SliderBG1.gotoFrame(f+1);
        SliderBG2.gotoFrame(f+1);
        SliderBG3.gotoFrame(f+1);
	}
	if (Value == 255) {
		SliderBG1.gotoFrame(f);
        SliderBG2.gotoFrame(f);
        SliderBG3.gotoFrame(f);
	}
	if (Value == 0) {
		SliderBG1.gotoFrame(0);
        SliderBG2.gotoFrame(0);
        SliderBG3.gotoFrame(0);
	}
}