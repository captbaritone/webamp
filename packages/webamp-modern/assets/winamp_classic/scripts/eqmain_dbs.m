#include "..\..\..\lib/std.mi"
#include "..\..\..\lib/winampconfig.mi"

Global Group EQg;
Global Button btnEQ0, btnEQ1, btnEQ2;
Global Layer eq1back, eq2back, eq3back, eq4back, eq5back, eq6back, eq7back, eq8back, eq9back, eq10back;
Global Boolean manual_set;

Global Layout normal;

#define ISOBANDS "31.5 Hz,63 Hz,125 Hz,250 Hz,500 Hz,1 KHz,2 KHz,4 KHz,8 KHz,16 KHz"
#define WINAMPBANDS "70 Hz,180 Hz,320 Hz,600 Hz,1 KHz,3 KHz,6 KHz,12 KHz,14 KHz,16 KHz"

System.onScriptLoaded() {
	WinampConfigGroup eqwcg = WinampConfig.getGroup("{72409F84-BAF1-4448-8211-D84A30A1591A}");
	int freqmode = eqwcg.getInt("frequencies"); // returns 0 for classical winamp levels, 1 for ISO levels

	EQg = getScriptGroup();

    eq1back = EQg.getObject("eq1back");
    eq2back = EQg.getObject("eq2back");
    eq3back = EQg.getObject("eq3back");
    eq4back = EQg.getObject("eq4back");
    eq5back = EQg.getObject("eq5back");
    eq6back = EQg.getObject("eq6back");
    eq7back = EQg.getObject("eq7back");
    eq8back = EQg.getObject("eq8back");
    eq9back = EQg.getObject("eq9back");
    eq10back = EQg.getObject("eq10back");

	normal = EQg.getParentLayout();
    btnEQ0 = EQg.findObject("12db");
	btnEQ1 = EQg.findObject("0db");
    btnEQ2 = EQg.findObject("-12db");
}

btnEQ0.onLeftClick() {
	manual_set = 1;
	for(int i=0; i<10; i++) setEqBand(i, 127);
	manual_set = 0;

    eq1back.setXMLParam("image", "eq.slider14");
    eq2back.setXMLParam("image", "eq.slider14");
    eq3back.setXMLParam("image", "eq.slider14");
    eq4back.setXMLParam("image", "eq.slider14");
    eq5back.setXMLParam("image", "eq.slider14");
    eq6back.setXMLParam("image", "eq.slider14");
    eq7back.setXMLParam("image", "eq.slider14");
    eq8back.setXMLParam("image", "eq.slider14");
    eq9back.setXMLParam("image", "eq.slider14");
    eq10back.setXMLParam("image", "eq.slider14");
}

btnEQ1.onLeftClick() {
	manual_set = 1;
	for(int i=0; i<10; i++) setEqBand(i, 1);
	manual_set = 0;

    eq1back.setXMLParam("image", "eq.slider0");
    eq2back.setXMLParam("image", "eq.slider0");
    eq3back.setXMLParam("image", "eq.slider0");
    eq4back.setXMLParam("image", "eq.slider0");
    eq5back.setXMLParam("image", "eq.slider0");
    eq6back.setXMLParam("image", "eq.slider0");
    eq7back.setXMLParam("image", "eq.slider0");
    eq8back.setXMLParam("image", "eq.slider0");
    eq9back.setXMLParam("image", "eq.slider0");
    eq10back.setXMLParam("image", "eq.slider0");
}

btnEQ2.onLeftClick() {
	manual_set = 1;
	for(int i=0; i<10; i++) setEqBand(i, -127);
	manual_set = 0;

    eq1back.setXMLParam("image", "eq.slider-14");
    eq2back.setXMLParam("image", "eq.slider-14");
    eq3back.setXMLParam("image", "eq.slider-14");
    eq4back.setXMLParam("image", "eq.slider-14");
    eq5back.setXMLParam("image", "eq.slider-14");
    eq6back.setXMLParam("image", "eq.slider-14");
    eq7back.setXMLParam("image", "eq.slider-14");
    eq8back.setXMLParam("image", "eq.slider-14");
    eq9back.setXMLParam("image", "eq.slider-14");
    eq10back.setXMLParam("image", "eq.slider-14");
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
}