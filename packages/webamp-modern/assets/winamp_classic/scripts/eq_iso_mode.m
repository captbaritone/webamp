#include "..\..\..\lib/std.mi"
#include "..\..\..\lib/winampconfig.mi"
#include "IsWACUP.m"

Global Group frameGroup;
Global GuiObject EQBG, eqtitlebar, viseq, eqswitch, eqclose, eqon, eqauto, eqpresets;
Global WinampConfigGroup eqwcg;

#define ISOBANDS "31.5 Hz,63 Hz,125 Hz,250 Hz,500 Hz,1 KHz,2 KHz,4 KHz,8 KHz,16 KHz"
#define WINAMPBANDS "70 Hz,180 Hz,320 Hz,600 Hz,1 KHz,3 KHz,6 KHz,12 KHz,14 KHz,16 KHz"

System.onScriptLoaded() {
    initDetector();
	eqwcg = WinampConfig.getGroup("{72409F84-BAF1-4448-8211-D84A30A1591A}");
	int freqmode = eqwcg.getInt("frequencies"); // returns 0 for classical winamp levels, 1 for ISO levels

	frameGroup = getScriptGroup();
    EQBG = frameGroup.findObject("eq.bg");
    eqtitlebar = frameGroup.findObject("waeq.titlebar");
    viseq = frameGroup.findObject("waeq.eqvis");
    eqswitch = frameGroup.findObject("eq.switch");
    eqclose = frameGroup.findObject("eq.close");
    eqon = frameGroup.findObject("eq.on");
    eqauto = frameGroup.findObject("eq.auto");
    eqpresets = frameGroup.findObject("eq.presets");

	system.onEqFreqChanged(freqmode);
}

System.onEqFreqChanged(boolean isoonoff)
{
	if (isoonoff == 1)
	{
        if(IsWACUP == 1){
            EQBG.setXmlParam("image", "wacup.iso.eq");
            eqtitlebar.setXmlParam("image", "wacupisoeq.titlebar.on");
            eqtitlebar.setXmlParam("inactiveimage", "wacupisoeq.titlebar.off");
        }else{
            EQBG.setXmlParam("image", "wa.iso.eq");
            eqtitlebar.setXmlParam("image", "waisoeq.titlebar.on");
            eqtitlebar.setXmlParam("inactiveimage", "waisoeq.titlebar.off");
        }
        viseq.setXmlParam("image", "wa.iso.eqvis.bg");
        eqswitch.setXmlParam("image", "iso.eq.switch");
        eqclose.setXmlParam("image", "iso.eq.close");
        eqon.setXmlParam("image", "iso.eq.off");
        eqon.setXmlParam("downimage", "iso.eq.offp");
        eqon.setXmlParam("activeimage", "iso.eq.on");
        eqauto.setXmlParam("image", "iso.eq.auto");
        eqauto.setXmlParam("downimage", "iso.eq.autop");
        eqauto.setXmlParam("activeimage", "iso.eq.autoon");
        eqpresets.setXmlParam("image", "iso.eq.presets");
        eqpresets.setXmlParam("downimage", "iso.eq.presetsp");
        //messageBox("Equalizer mode is "+integerToString(isoonoff), "Equalizer mode", 1, "");
	}
	else
	{
        if(IsWACUP != 0){
            EQBG.setXmlParam("image", "wacup.eq");
            eqtitlebar.setXmlParam("image", "wacupeq.titlebar.on");
            eqtitlebar.setXmlParam("inactiveimage", "wacupeq.titlebar.off");
        }else{
            EQBG.setXmlParam("image", "wa.eq");
            eqtitlebar.setXmlParam("image", "waeq.titlebar.on");
            eqtitlebar.setXmlParam("inactiveimage", "waeq.titlebar.off");
        }
        viseq.setXmlParam("image", "wa.eqvis.bg");
        eqswitch.setXmlParam("image", "eq.switch");
        eqclose.setXmlParam("image", "eq.close");
        eqon.setXmlParam("image", "eq.off");
        eqon.setXmlParam("downimage", "eq.offp");
        eqon.setXmlParam("activeimage", "eq.on");
        eqauto.setXmlParam("image", "eq.auto");
        eqauto.setXmlParam("downimage", "eq.autop");
        eqauto.setXmlParam("activeimage", "eq.autoon");
        eqpresets.setXmlParam("image", "eq.presets");
        eqpresets.setXmlParam("downimage", "eq.presetsp");
        //messageBox("Equalizer mode is "+integerToString(isoonoff), "Equalizer mode", 1, "");
	}
}