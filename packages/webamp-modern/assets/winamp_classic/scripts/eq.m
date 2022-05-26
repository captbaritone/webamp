#include <lib/std.mi>
#include <lib/winampconfig.mi>

Function initEqualizer();
Function setEqualizerRegion(Int intEqualizerBandValue, Layer layerEqualizerBand);

Global Group frameGroup, use;
Global Button btnEQp12,btnEQ0,btnEQm12;
// Global Layer eqBand;
// Global Boolean silent_change;
Global Boolean silent_change; // don't show any info in display

Global Container main;
Global Layout normal;
Global Layout mainNormal;


Global Layer layerConfigNormalEqualizerBand00;
Global Layer layerConfigNormalEqualizerBand01;
Global Layer layerConfigNormalEqualizerBand02;
Global Layer layerConfigNormalEqualizerBand03;
Global Layer layerConfigNormalEqualizerBand04;
Global Layer layerConfigNormalEqualizerBand05;
Global Layer layerConfigNormalEqualizerBand06;
Global Layer layerConfigNormalEqualizerBand07;
Global Layer layerConfigNormalEqualizerBand08;
Global Layer layerConfigNormalEqualizerBand09;
Global Layer layerConfigNormalEqualizerBand10;

Global Slider sliderConfigNormalEqualizerBand00;
Global Slider sliderConfigNormalEqualizerBand01;
Global Slider sliderConfigNormalEqualizerBand02;
Global Slider sliderConfigNormalEqualizerBand03;
Global Slider sliderConfigNormalEqualizerBand04;
Global Slider sliderConfigNormalEqualizerBand05;
Global Slider sliderConfigNormalEqualizerBand06;
Global Slider sliderConfigNormalEqualizerBand07;
Global Slider sliderConfigNormalEqualizerBand08;
Global Slider sliderConfigNormalEqualizerBand09;
Global Slider sliderConfigNormalEqualizerBand10;

#define ISOBANDS "31.5 Hz,63 Hz,125 Hz,250 Hz,500 Hz,1 KHz,2 KHz,4 KHz,8 KHz,16 KHz"
#define WINAMPBANDS "70 Hz,180 Hz,320 Hz,600 Hz,1 KHz,3 KHz,6 KHz,12 KHz,14 KHz,16 KHz"

System.onScriptLoaded() {
	// WinampConfigGroup eqwcg = WinampConfig.getGroup("{72409F84-BAF1-4448-8211-D84A30A1591A}");
	// int freqmode = eqwcg.getInt("frequencies"); // returns 0 for classical winamp levels, 1 for ISO levels

	main = getContainer("main");
	mainNormal = main.getLayout("normal");

	frameGroup = getScriptGroup();
	normal = frameGroup.getParentLayout();
	btnEQp12 = frameGroup.findObject("EQ_p12");
	btnEQ0 = frameGroup.findObject("EQ_0");
	btnEQm12 = frameGroup.findObject("EQ_m12");
	// eqBand = frameGroup.findObject("equalizer.band.label");

	// system.onEqFreqChanged(freqmode);

	initEqualizer();
}

initEqualizer() {
	layerConfigNormalEqualizerBand00 = normal.findObject("preampback");
	
	layerConfigNormalEqualizerBand01 = normal.findObject("eq1back");
	layerConfigNormalEqualizerBand02 = normal.findObject("eq2back");
	layerConfigNormalEqualizerBand03 = normal.findObject("eq3back");
	layerConfigNormalEqualizerBand04 = normal.findObject("eq4back");
	layerConfigNormalEqualizerBand05 = normal.findObject("eq5back");
	layerConfigNormalEqualizerBand06 = normal.findObject("eq6back");
	layerConfigNormalEqualizerBand07 = normal.findObject("eq7back");
	layerConfigNormalEqualizerBand08 = normal.findObject("eq8back");
	layerConfigNormalEqualizerBand09 = normal.findObject("eq9back");
	layerConfigNormalEqualizerBand10 = normal.findObject("eq10back");
	
	sliderConfigNormalEqualizerBand00 = normal.findObject("preamp");
	
	sliderConfigNormalEqualizerBand01 = normal.findObject("eq1");
	sliderConfigNormalEqualizerBand02 = normal.findObject("eq2");
	sliderConfigNormalEqualizerBand03 = normal.findObject("eq3");
	sliderConfigNormalEqualizerBand04 = normal.findObject("eq4");
	sliderConfigNormalEqualizerBand05 = normal.findObject("eq5");
	sliderConfigNormalEqualizerBand06 = normal.findObject("eq6");
	sliderConfigNormalEqualizerBand07 = normal.findObject("eq7");
	sliderConfigNormalEqualizerBand08 = normal.findObject("eq8");
	sliderConfigNormalEqualizerBand09 = normal.findObject("eq9");
	sliderConfigNormalEqualizerBand10 = normal.findObject("eq10");

	silent_change = 1;
	for(int i=0; i<10; i++) {
		// setEqBand(i, -127);
		system.onEqBandChanged(i, system.getEqBand(i));
	}
	silent_change = 0;
}

setEqualizerRegion(Int intEqualizerBandValue, Layer layerEqualizerBand) {
	int level = 28-((128-intEqualizerBandValue) / 255 * 27) ;
	layerEqualizerBand.setXmlParam("image", "eq.slider.level" + System.integerToString(level) );
}



btnEQp12.onLeftClick() {
	silent_change = 1;
	for(int i=0; i<10; i++) setEqBand(i, 127);
	silent_change = 0;
}

btnEQ0.onLeftClick() {
	silent_change = 1;
	for(int i=0; i<10; i++) setEqBand(i, 0);
	silent_change = 0;
}

btnEQm12.onLeftClick() {
	silent_change = 1;
	for(int i=0; i<10; i++) setEqBand(i, -127);
	silent_change = 0;
}

/* System.onEqFreqChanged (boolean isoonoff)
{
	if (isoonoff == 1)
	{
		eqBand.setXmlParam("image", "drawer.eq.label.iso");
		for(int i=0; i<10; i++) frameGroup.findObject("eq"+integerToString(i+1)).setXmlParam("tooltip", getToken(ISOBANDS,",",i));
	}
	else
	{
		eqBand.setXmlParam("image", "drawer.eq.label.winamp");
		for(int i=0; i<10; i++) frameGroup.findObject("eq"+integerToString(i+1)).setXmlParam("tooltip", getToken(WINAMPBANDS,",",i));
	}
} */

system.onEqBandChanged(int band, int value)
{
	// if (silent_change) return;
	if (silent_change == 0) {

		String t;
		Float f = value;
		f = f / 10.5;
		WinampConfigGroup eqwcg = WinampConfig.getGroup("{72409F84-BAF1-4448-8211-D84A30A1591A}");
		if (eqwcg.getInt("frequencies") == 1) {
			if (f >= 0) t = "EQ: " + translate(getToken(ISOBANDS,",",band)) + ": +" + floattostring(f, 1) + " "+ translate("dB");
			else t = "EQ: " + translate(getToken(ISOBANDS,",",band)) + ": " + floattostring(f, 1) + " "+ translate("dB");
		}
		else {
			if (f >= 0) t = "EQ: " + translate(getToken(WINAMPBANDS,",",band)) + ": +" + floattostring(f, 1) + " "+ translate("dB");
			else t = "EQ: " + translate(getToken(WINAMPBANDS,",",band)) + ": " + floattostring(f, 1) + " "+ translate("dB");
		}

		mainNormal.sendAction("showinfo", t, 0,0,0,0);

	}
	//if (band == 0) {
	//	setEqualizerRegion(value, layerConfigNormalEqualizerBand00);
	//} else 
	if (band == 0) {
		setEqualizerRegion(value, layerConfigNormalEqualizerBand01);
	} else if (band == 1) {
		setEqualizerRegion(value, layerConfigNormalEqualizerBand02);
	} else if (band == 2) {
		setEqualizerRegion(value, layerConfigNormalEqualizerBand03);
	} else if (band == 3) {
		setEqualizerRegion(value, layerConfigNormalEqualizerBand04);
	} else if (band == 4) {
		setEqualizerRegion(value, layerConfigNormalEqualizerBand05);
	} else if (band == 5) {
		setEqualizerRegion(value, layerConfigNormalEqualizerBand06);
	} else if (band == 6) {
		setEqualizerRegion(value, layerConfigNormalEqualizerBand07);
	} else if (band == 7) {
		setEqualizerRegion(value, layerConfigNormalEqualizerBand08);
	} else if (band == 8) {
		setEqualizerRegion(value, layerConfigNormalEqualizerBand09);
	} else if (band == 9) {
		setEqualizerRegion(value, layerConfigNormalEqualizerBand10);
	}
}

system.onEqPreampChanged(int value)
{
	slider s = getScriptGroup().findObject("preamp");
	int value2 = s.getPosition(); // Somehow this function returns a range from [-127;125] with hotpos -3, so we take the slider instead
	String t = "EQ: " + translate("Preamp:") + " ";
	Float f = value2;
	f = f / 10.5;
	if (f >= -3) t += "+"+floattostring(f, 1) + " "+ translate("dB");
	else t += floattostring(f, 1) + " "+ translate("dB");
	
	mainNormal.sendAction("showinfo", t, 0,0,0,0);

	setEqualizerRegion(value, layerConfigNormalEqualizerBand00);
}

