#include <lib/std.mi>
#include <lib/winampconfig.mi>

Global Group frameGroup, use;
Global Button btnEQp12,btnEQ0,btnEQm12;
Global Layer eqBand;
Global Boolean manual_set;

Global Layout normal;

#define ISOBANDS "31.5 Hz,63 Hz,125 Hz,250 Hz,500 Hz,1 KHz,2 KHz,4 KHz,8 KHz,16 KHz"
#define WINAMPBANDS "70 Hz,180 Hz,320 Hz,600 Hz,1 KHz,3 KHz,6 KHz,12 KHz,14 KHz,16 KHz"

System.onScriptLoaded() {
	WinampConfigGroup eqwcg = WinampConfig.getGroup("{72409F84-BAF1-4448-8211-D84A30A1591A}");
	int freqmode = eqwcg.getInt("frequencies"); // returns 0 for classical winamp levels, 1 for ISO levels

	frameGroup = getScriptGroup();
	normal = frameGroup.getParentLayout();
	btnEQp12 = frameGroup.findObject("EQ_p12");
	btnEQ0 = frameGroup.findObject("EQ_0");
	btnEQm12 = frameGroup.findObject("EQ_m12");
	eqBand = frameGroup.findObject("equalizer.band.label");

	system.onEqFreqChanged(freqmode);
}

btnEQp12.onLeftClick() {
	manual_set = 1;
	for(int i=0; i<10; i++) setEqBand(i, 127);
	manual_set = 0;
}

btnEQ0.onLeftClick() {
	manual_set = 1;
	for(int i=0; i<10; i++) setEqBand(i, 0);
	manual_set = 0;
}

btnEQm12.onLeftClick() {
	manual_set = 1;
	for(int i=0; i<10; i++) setEqBand(i, -127);
	manual_set = 0;
}

System.onEqFreqChanged (boolean isoonoff)
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
}

system.onEqBandChanged(int band, int value)
{
	if (manual_set) return;
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

	normal.sendAction("showinfo", t, 0,0,0,0);
}

system.onEqPreampChanged(int value)
{
	slider s = getScriptGroup().findObject("preamp");
	value = s.getPosition(); // Somehow this function returns a range from [-127;125] with hotpos -3, so we take the slider instead
	String t = "EQ: " + translate("Preamp:") + " ";
	Float f = value;
	f = f / 10.5;
	if (f >= -3) t += "+"+floattostring(f, 1) + " "+ translate("dB");
	else t += floattostring(f, 1) + " "+ translate("dB");
	
	normal.sendAction("showinfo", t, 0,0,0,0);
}