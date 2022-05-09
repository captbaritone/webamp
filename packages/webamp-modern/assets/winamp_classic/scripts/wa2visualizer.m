/*---------------------------------------------------
-----------------------------------------------------
Filename:	wa2visualizer.m
Version:	2.1

Type:		maki
Date:		07. Okt. 2007 - 19:56 , May 24th 2021 - 2:13am UTC+1
Author:		Martin Poehlmann aka Deimos, Eris Lund (0x5066), mirzi
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
			www.martin.deimos.de.vu

Note:		Ripped from Winamp Modern, removed the VU Meter section
			as it's not relevant just yet, this also includes
			the option to set the Spectrum Analyzer coloring.
-----------------------------------------------------
---------------------------------------------------*/

#include "..\..\..\lib/std.mi"

Function refreshVisSettings();
Function setVis (int mode);
Function ProcessMenuResult (int a);

Global Group scriptGroup;
Global Vis visualizer;


Global PopUpMenu visMenu;
Global PopUpMenu pksmenu;
Global PopUpMenu anamenu;
Global PopUpMenu anasettings;
Global PopUpMenu oscsettings;
Global PopUpMenu stylemenu;
Global PopUpMenu fpsmenu;

Global Int currentMode, a_falloffspeed, p_falloffspeed, osc_render, ana_render, a_coloring, v_fps;
Global Boolean show_peaks, isShade;
Global layer trigger;

Global Layout thislayout;
Global Container main;

System.onScriptLoaded()
{ 
	scriptGroup = getScriptGroup();

	visualizer = scriptGroup.findObject("wa.vis");

	trigger = scriptGroup.findObject("main.vis.trigger");

	visualizer.setXmlParam("Peaks", integerToString(show_peaks));
	visualizer.setXmlParam("peakfalloff", integerToString(p_falloffspeed));
	visualizer.setXmlParam("falloff", integerToString(a_falloffspeed));
	visualizer.setXmlParam("oscstyle", integerToString(osc_render));
	visualizer.setXmlParam("bandwidth", integerToString(ana_render));
	refreshVisSettings();
}

refreshVisSettings ()
{
	currentMode = getPrivateInt(getSkinName(), "Visualizer Mode", 1);
	show_peaks = getPrivateInt(getSkinName(), "Visualizer show Peaks", 1);
	a_falloffspeed = getPrivateInt(getSkinName(), "Visualizer analyzer falloff", 3);
	p_falloffspeed = getPrivateInt(getSkinName(), "Visualizer Peaks falloff", 2);
	osc_render = getPrivateInt(getSkinName(), "Oscilloscope Settings", 1);
	ana_render = getPrivateInt(getSkinName(), "Spectrum Analyzer Settings", 2);
	a_coloring = getPrivateInt(getSkinName(), "Visualizer analyzer coloring", 0);
	v_fps = getPrivateInt(getSkinName(), "Visualizer Refresh rate", 3);

	visualizer.setXmlParam("Peaks", integerToString(show_peaks));
	visualizer.setXmlParam("peakfalloff", integerToString(p_falloffspeed));
	visualizer.setXmlParam("falloff", integerToString(a_falloffspeed));
	visualizer.setXmlParam("oscstyle", integerToString(osc_render));
	visualizer.setXmlParam("bandwidth", integerToString(ana_render));

	if (a_coloring == 0)
	{
		visualizer.setXmlParam("coloring", "Normal");
	}
	else if (a_coloring == 1)
	{
		visualizer.setXmlParam("coloring", "Normal");
	}
	else if (a_coloring == 2)
	{
		visualizer.setXmlParam("coloring", "Fire");
	}
	else if (a_coloring == 3)
	{
		visualizer.setXmlParam("coloring", "Line");
	}


	if (osc_render == 0)
		{
			visualizer.setXmlParam("oscstyle", "Lines");
		}
		else if (osc_render == 2)
		{
			visualizer.setXmlParam("oscstyle", "Lines");
		}
		else if (osc_render == 1)
		{
			visualizer.setXmlParam("oscstyle", "Solid");
		}
		else if (osc_render == 3)
		{
			visualizer.setXmlParam("oscstyle", "Dots");
		}
	setPrivateInt(getSkinName(), "Oscilloscope Settings", osc_render);
    
	if (ana_render == 0)
		{
			visualizer.setXmlParam("bandwidth", "Thin");
		}
		else if (ana_render == 1)
		{
			visualizer.setXmlParam("bandwidth", "Thin");
		}
		else if (ana_render == 2)
		{
			visualizer.setXmlParam("bandwidth", "wide");
		}
	setPrivateInt(getSkinName(), "Spectrum Analyzer Settings", ana_render);
	if (v_fps == 0)
		{
			visualizer.setXmlParam("fps", "9");
		}
		else if (v_fps == 1)
		{
			visualizer.setXmlParam("fps", "9");
		}
		else if (v_fps == 2)
		{
			visualizer.setXmlParam("fps", "18");
		}
		else if (v_fps == 3)
		{
			visualizer.setXmlParam("fps", "35");
		}
		else if (v_fps == 4)
		{
			visualizer.setXmlParam("fps", "70");
		}

	setVis (currentMode);
}

trigger.onLeftButtonDown (int x, int y)
{
	if (isKeyDown(VK_ALT) && isKeyDown(VK_SHIFT) && isKeyDown(VK_CONTROL))
	{
		if (visualizer.getXmlParam("fliph") == "1")
		{
			visualizer.setXmlParam("fliph", "0");
		}
		else
		{
			visualizer.setXmlParam("fliph", "1");
		}
		return;
	}

	if (isKeyDown(4) && isKeyDown(VK_SHIFT) && isKeyDown(VK_CONTROL))
	{
		if (visualizer.getXmlParam("flipv") == "1")
		{
			visualizer.setXmlParam("flipv", "0");
		}
		else
		{
			visualizer.setXmlParam("flipv", "1");
		}
		return;
	}


	currentMode++;

	if (currentMode == 3)
	{
		currentMode = 0;
	}

	setVis (currentMode);
	complete;
}

trigger.onRightButtonUp (int x, int y)
{
	visMenu = new PopUpMenu;
	pksmenu = new PopUpMenu;
	anamenu = new PopUpMenu;
	stylemenu = new PopUpMenu;
	anasettings = new PopUpMenu;
	oscsettings = new PopUpMenu;
	fpsmenu = new PopUpMenu;

	visMenu.addCommand("Visualization mode:", 999, 0, 1);
	visMenu.addSeparator();
	visMenu.addCommand("Off", 100, currentMode == 0, 0);
	visMenu.addCommand("Spectrum analyzer", 1, currentMode == 1, 0);
	visMenu.addCommand("Oscilliscope", 2, currentMode == 2, 0);
	
	visMenu.addSeparator();
	visMenu.addCommand("Modern Visualizer Settings", 998, 0, 1);
	visMenu.addSeparator();
	visMenu.addSubmenu(fpsmenu, "Refresh rate");
	fpsmenu.addCommand("9fps", 800, v_fps == 0, 0);
	fpsmenu.addCommand("18fps", 802, v_fps == 2, 0);
	fpsmenu.addCommand("35fps", 803, v_fps == 3, 0);
	fpsmenu.addCommand("70fps", 804, v_fps == 4, 0);
	visMenu.addSubmenu(anasettings, "Spectrum analyzer options");
	//anasettings.addCommand("Band line width:", 997, 0, 1);
	//anasettings.addSeparator();

	anasettings.addCommand("Normal style", 400, a_coloring == 0, 0);
	anasettings.addCommand("Fire style", 402, a_coloring == 2, 0);
	anasettings.addCommand("Line style", 403, a_coloring == 3, 0);
	anasettings.addSeparator();
	anasettings.addCommand("Peaks", 101, show_peaks == 1, 0);
	anasettings.addSeparator();
	anasettings.addCommand("Thin bands", 701, ana_render == 1, 0);
	if(getDateDay(getDate()) == 1 && getDateMonth(getDate()) == 3){
		anasettings.addCommand("乇乂丅尺卂 丅卄工匚匚", 702, ana_render == 2, 0);
	}else{
		anasettings.addCommand("Thick bands", 702, ana_render == 2, 0);
	}
	anasettings.addSeparator();

	anasettings.addSubMenu(anamenu, "Analyzer falloff");
	anamenu.addCommand("Slower", 300, a_falloffspeed == 0, 0);
	anamenu.addCommand("Slow", 301, a_falloffspeed == 1, 0);
	anamenu.addCommand("Moderate", 302, a_falloffspeed == 2, 0);
	anamenu.addCommand("Fast", 303, a_falloffspeed == 3, 0);
	anamenu.addCommand("Faster", 304, a_falloffspeed == 4, 0);
	anasettings.addSubMenu(pksmenu, "Peaks falloff");
	pksmenu.addCommand("Slower", 200, p_falloffspeed == 0, 0);
	pksmenu.addCommand("Slow", 201, p_falloffspeed == 1, 0);
	pksmenu.addCommand("Moderate", 202, p_falloffspeed == 2, 0);
	pksmenu.addCommand("Fast", 203, p_falloffspeed == 3, 0);
	pksmenu.addCommand("Faster", 204, p_falloffspeed == 4, 0);

	//anasettings.addSubMenu(stylemenu, "Analyzer Coloring");

	visMenu.addSubmenu(oscsettings, "Oscilliscope Options");
	//oscsettings.addCommand("Oscilloscope drawing style:", 996, 0, 1);
	//oscsettings.addSeparator();
	oscsettings.addCommand("Dot scope", 603, osc_render == 3, 0);
	oscsettings.addCommand("Line scope", 601, osc_render == 1, 0);
	oscsettings.addCommand("Solid scope", 602, osc_render == 2, 0);

	ProcessMenuResult (visMenu.popAtMouse());

	delete visMenu;
	delete pksmenu;
	delete anamenu;
	delete stylemenu;
	delete anasettings;
	delete oscsettings;
	delete fpsmenu;

	complete;	
}

ProcessMenuResult (int a)
{
	if (a < 1) return;

	if (a > 0 && a <= 6 || a == 100)
	{
		if (a == 100) a = 0;
		setVis(a);
	}

	else if (a == 101)
	{
		show_peaks = (show_peaks - 1) * (-1);
		visualizer.setXmlParam("Peaks", integerToString(show_peaks));
		setPrivateInt(getSkinName(), "Visualizer show Peaks", show_peaks);
	}

	else if (a >= 200 && a <= 204)
	{
		p_falloffspeed = a - 200;
		visualizer.setXmlParam("peakfalloff", integerToString(p_falloffspeed));
		setPrivateInt(getSkinName(), "Visualizer Peaks falloff", p_falloffspeed);
	}

	else if (a >= 300 && a <= 304)
	{
		a_falloffspeed = a - 300;
		visualizer.setXmlParam("falloff", integerToString(a_falloffspeed));
		setPrivateInt(getSkinName(), "Visualizer analyzer falloff", a_falloffspeed);
	}

else if (a >= 400 && a <= 403)
	{
		a_coloring = a - 400;
		if (a_coloring == 0)
		{
			visualizer.setXmlParam("coloring", "Normal");
		}
		else if (a_coloring == 1)
		{
			visualizer.setXmlParam("coloring", "Normal");
		}
		else if (a_coloring == 2)
		{
			visualizer.setXmlParam("coloring", "Fire");
		}
		else if (a_coloring == 3)
		{
			visualizer.setXmlParam("coloring", "Line");
		}
		setPrivateInt(getSkinName(), "Visualizer analyzer coloring", a_coloring);
	}

	else if (a >= 600 && a <= 603)
	{
		osc_render = a - 600;
		if (osc_render == 0)
		{
			visualizer.setXmlParam("oscstyle", "lines");
		}
		else if (osc_render == 2)
		{
			visualizer.setXmlParam("oscstyle", "lines");
		}
		else if (osc_render == 1)
		{
			visualizer.setXmlParam("oscstyle", "solid");
		}
		else if (osc_render == 3)
		{
			visualizer.setXmlParam("oscstyle", "dots");
		}
		setPrivateInt(getSkinName(), "Oscilloscope Settings", osc_render);
	}

	else if (a >= 700 && a <= 702)
	{
		ana_render = a - 700;
		if (ana_render == 0)
		{
			visualizer.setXmlParam("bandwidth", "thin");
		}
		else if (ana_render == 1)
		{
			visualizer.setXmlParam("bandwidth", "thin");
		}
		else if (ana_render == 2)
		{
			visualizer.setXmlParam("bandwidth", "wide");
		}
		setPrivateInt(getSkinName(), "Spectrum Analyzer Settings", ana_render);
	}

	else if (a >= 800 && a <= 804)
	{
		v_fps = a - 800;
		if (v_fps == 0)
		{
			visualizer.setXmlParam("fps", "9");
		}
		else if (v_fps == 1)
		{
			visualizer.setXmlParam("fps", "9");
		}
		else if (v_fps == 2)
		{
			visualizer.setXmlParam("fps", "18");
		}
		else if (v_fps == 3)
		{
			visualizer.setXmlParam("fps", "35");
		}
		else if (v_fps == 4)
		{
			visualizer.setXmlParam("fps", "70");
		}
		setPrivateInt(getSkinName(), "Visualizer Refresh rate", v_fps);
	}
}

setVis (int mode)
{
	setPrivateInt(getSkinName(), "Visualizer Mode", mode);
	if (mode == 0)
	{
		visualizer.setMode(0);
	}
	else if (mode == 1)
	{
		visualizer.setMode(1);
	}
	else if (mode == 2)
	{
		visualizer.setMode(2);
	}
	currentMode = mode;
}

// Sync Normal and Shade Layout

main.onBeforeSwitchToLayout(Layout oldlayout, Layout newlayout)
{
	if (newlayout != thislayout)
	{
		return;
	}
	
	refreshVisSettings();
}