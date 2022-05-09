#include "..\..\..\lib/std.mi"
#include "..\..\..\lib/winampconfig.mi"

Global Slider pre, eq1, eq2, eq3, eq4, eq5, eq6, eq7, eq8, eq9, eq10;
Global Layer pre_layer, eq1back, eq2back, eq3back, eq4back, eq5back, eq6back, eq7back, eq8back, eq9back, eq10back;
Global String XMLtext;
Global WinampConfigGroup eqwcg;
Global int freqmode;
Function int GetSliderValue(int currentslider);

#define ISOBANDS "31.5 Hz,63 Hz,125 Hz,250 Hz,500 Hz,1 KHz,2 KHz,4 KHz,8 KHz,16 KHz"
#define WINAMPBANDS "70 Hz,180 Hz,320 Hz,600 Hz,1 KHz,3 KHz,6 KHz,12 KHz,14 KHz,16 KHz"

System.onScriptLoaded()
{
    eqwcg = WinampConfig.getGroup("{72409F84-BAF1-4448-8211-D84A30A1591A}");
	freqmode = eqwcg.getInt("frequencies"); // returns 0 for classical winamp levels, 1 for ISO levels

    Group EQ = getScriptGroup();
    pre = EQ.getObject("preamp");
    pre_layer = EQ.getObject("preamp_layer");
    eq1 = EQ.getObject("eq1");
    eq1back = EQ.getObject("eq1back");
    eq2 = EQ.getObject("eq2");
    eq2back = EQ.getObject("eq2back");
    eq3 = EQ.getObject("eq3");
    eq3back = EQ.getObject("eq3back");
    eq4 = EQ.getObject("eq4");
    eq4back = EQ.getObject("eq4back");
    eq5 = EQ.getObject("eq5");
    eq5back = EQ.getObject("eq5back");
    eq6 = EQ.getObject("eq6");
    eq6back = EQ.getObject("eq6back");
    eq7 = EQ.getObject("eq7");
    eq7back = EQ.getObject("eq7back");
    eq8 = EQ.getObject("eq8");
    eq8back = EQ.getObject("eq8back");
    eq9 = EQ.getObject("eq9");
    eq9back = EQ.getObject("eq9back");
    eq10 = EQ.getObject("eq10");
    eq10back = EQ.getObject("eq10back");

    system.onEqFreqChanged(freqmode);

}

System.onEqFreqChanged(boolean isoonoff)
{
	if (isoonoff == 1)
	{
		XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(pre.getPosition()));
        pre_layer.setXMLParam("image", XMLtext);
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(eq1.getPosition()));
        eq1back.setXMLParam("image", XMLtext);
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(eq2.getPosition()));
        eq2back.setXMLParam("image", XMLtext);
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(eq3.getPosition()));
        eq3back.setXMLParam("image", XMLtext);
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(eq4.getPosition()));
        eq4back.setXMLParam("image", XMLtext);
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(eq5.getPosition()));
        eq5back.setXMLParam("image", XMLtext);
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(eq6.getPosition()));
        eq6back.setXMLParam("image", XMLtext);
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(eq7.getPosition()));
        eq7back.setXMLParam("image", XMLtext);
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(eq8.getPosition()));
        eq8back.setXMLParam("image", XMLtext);
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(eq9.getPosition()));
        eq9back.setXMLParam("image", XMLtext);
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(eq10.getPosition()));
        eq10back.setXMLParam("image", XMLtext);
	}
	else
	{
		XMLtext = "eq.slider"+integerToString(GetSliderValue(pre.getPosition()));
        pre_layer.setXMLParam("image", XMLtext);
        XMLtext = "eq.slider"+integerToString(GetSliderValue(eq1.getPosition()));
        eq1back.setXMLParam("image", XMLtext);
        XMLtext = "eq.slider"+integerToString(GetSliderValue(eq2.getPosition()));
        eq2back.setXMLParam("image", XMLtext);
        XMLtext = "eq.slider"+integerToString(GetSliderValue(eq3.getPosition()));
        eq3back.setXMLParam("image", XMLtext);
        XMLtext = "eq.slider"+integerToString(GetSliderValue(eq4.getPosition()));
        eq4back.setXMLParam("image", XMLtext);
        XMLtext = "eq.slider"+integerToString(GetSliderValue(eq5.getPosition()));
        eq5back.setXMLParam("image", XMLtext);
        XMLtext = "eq.slider"+integerToString(GetSliderValue(eq6.getPosition()));
        eq6back.setXMLParam("image", XMLtext);
        XMLtext = "eq.slider"+integerToString(GetSliderValue(eq7.getPosition()));
        eq7back.setXMLParam("image", XMLtext);
        XMLtext = "eq.slider"+integerToString(GetSliderValue(eq8.getPosition()));
        eq8back.setXMLParam("image", XMLtext);
        XMLtext = "eq.slider"+integerToString(GetSliderValue(eq9.getPosition()));
        eq9back.setXMLParam("image", XMLtext);
        XMLtext = "eq.slider"+integerToString(GetSliderValue(eq10.getPosition()));
        eq10back.setXMLParam("image", XMLtext);
	}
}

pre.onSetPosition(int newpos)
{
    freqmode = eqwcg.getInt("frequencies");
    if (freqmode == 1)
	{
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(newpos));
    }else{
        XMLtext = "eq.slider"+integerToString(GetSliderValue(newpos));
    }
    pre_layer.setXMLParam("image", XMLtext);

}

eq1.onSetPosition(int newpos)
{
    freqmode = eqwcg.getInt("frequencies");
    if (freqmode == 1)
	{
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(newpos));
    }else{
        XMLtext = "eq.slider"+integerToString(GetSliderValue(newpos));
    }
    eq1back.setXMLParam("image", XMLtext);

}
eq2.onSetPosition(int newpos)
{
    freqmode = eqwcg.getInt("frequencies");
    if (freqmode == 1)
	{
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(newpos));
    }else{
        XMLtext = "eq.slider"+integerToString(GetSliderValue(newpos));
    }
    eq2back.setXMLParam("image", XMLtext);

}
eq3.onSetPosition(int newpos)
{
    freqmode = eqwcg.getInt("frequencies");
    if (freqmode == 1)
	{
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(newpos));
    }else{
        XMLtext = "eq.slider"+integerToString(GetSliderValue(newpos));
    }
    eq3back.setXMLParam("image", XMLtext);

}
eq4.onSetPosition(int newpos)
{
    freqmode = eqwcg.getInt("frequencies");
    if (freqmode == 1)
	{
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(newpos));
    }else{
        XMLtext = "eq.slider"+integerToString(GetSliderValue(newpos));
    }
    eq4back.setXMLParam("image", XMLtext);

}
eq5.onSetPosition(int newpos)
{
    freqmode = eqwcg.getInt("frequencies");
    if (freqmode == 1)
	{
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(newpos));
    }else{
        XMLtext = "eq.slider"+integerToString(GetSliderValue(newpos));
    }
    eq5back.setXMLParam("image", XMLtext);

}
eq6.onSetPosition(int newpos)
{
    freqmode = eqwcg.getInt("frequencies");
    if (freqmode == 1)
	{
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(newpos));
    }else{
        XMLtext = "eq.slider"+integerToString(GetSliderValue(newpos));
    }
    eq6back.setXMLParam("image", XMLtext);

}
eq7.onSetPosition(int newpos)
{
    freqmode = eqwcg.getInt("frequencies");
    if (freqmode == 1)
	{
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(newpos));
    }else{
        XMLtext = "eq.slider"+integerToString(GetSliderValue(newpos));
    }
    eq7back.setXMLParam("image", XMLtext);

}
eq8.onSetPosition(int newpos)
{
    freqmode = eqwcg.getInt("frequencies");
    if (freqmode == 1)
	{
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(newpos));
    }else{
        XMLtext = "eq.slider"+integerToString(GetSliderValue(newpos));
    }
    eq8back.setXMLParam("image", XMLtext);

}
eq9.onSetPosition(int newpos)
{
    freqmode = eqwcg.getInt("frequencies");
    if (freqmode == 1)
	{
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(newpos));
    }else{
        XMLtext = "eq.slider"+integerToString(GetSliderValue(newpos));
    }
    eq9back.setXMLParam("image", XMLtext);

}
eq10.onSetPosition(int newpos)
{
    freqmode = eqwcg.getInt("frequencies");
    if (freqmode == 1)
	{
        XMLtext = "iso.eq.slider"+integerToString(GetSliderValue(newpos));
    }else{
        XMLtext = "eq.slider"+integerToString(GetSliderValue(newpos));
    }
    eq10back.setXMLParam("image", XMLtext);
}

int GetSliderValue(Int CurrentSlider)
{
    if(CurrentSlider<=-1)
    {
        CurrentSlider = ((CurrentSlider*27)/255)-1;
    }
    else if(CurrentSlider>=0)
    {
        CurrentSlider = ((CurrentSlider*27)/255)+1;
    }
    return CurrentSlider;
}