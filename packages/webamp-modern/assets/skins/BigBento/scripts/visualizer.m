/*---------------------------------------------------
-----------------------------------------------------
Filename:	visualizer.m
Version:	1.4

Type:		maki
Date:		07. Okt. 2007 - 19:56  
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu

Note:		This script handles also the timer reflection
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>

#include attribs/init_appearance.m

Function refreshVisSettings();
Function setVis (int mode);
Function ProcessMenuResult (int a);

Global Group scriptGroup;
Global Vis visualizer, visualizer_m;
Global Text tmr;

Global PopUpMenu visMenu;
Global PopUpMenu specmenu;
Global PopUpMenu oscmenu;
Global PopUpMenu pksmenu;
Global PopUpMenu anamenu;
Global PopUpMenu stylemenu;

Global Int currentMode, a_falloffspeed, p_falloffspeed, a_coloring;
Global Boolean show_peaks, isShade;
Global layer trigger;

Global Layout thislayout;
Global Container main;

System.onScriptLoaded()
{ 
	initAttribs_Appearance(); // init appearance attribs

	scriptGroup = getScriptGroup();
	thislayout = scriptGroup.getParentLayout();
	main = thislayout.getContainer();

	// this script runs in shade and normal layout, we store this bool to prevent some actions to recieve the shade vis.
	isShade = (scriptGroup.getParentlayout().getID() == "shade");

	visualizer = scriptGroup.findObject("main.vis");

	trigger = scriptGroup.findObject("main.vis.trigger");

	if (!isShade)
	{
		visualizer_m = scriptGroup.findObject("main.vis.mirror");
		vis_reflection_attrib.onDataChanged();

		tmr = scriptGroup.findObject("SongTime");
		timer_reflection_attrib.onDataChanged();
	}



	visualizer.setXmlParam("peaks", integerToString(show_peaks));
	visualizer.setXmlParam("peakfalloff", integerToString(p_falloffspeed));
	visualizer.setXmlParam("falloff", integerToString(a_falloffspeed));

	refreshVisSettings ();
}

refreshVisSettings ()
{
	currentMode = getPrivateInt(getSkinName(), "Visualizer Mode", 1);
	show_peaks = getPrivateInt(getSkinName(), "Visualizer show Peaks", 1);
	a_falloffspeed = getPrivateInt(getSkinName(), "Visualizer analyzer falloff", 3);
	p_falloffspeed = getPrivateInt(getSkinName(), "Visualizer peaks falloff", 2);
	a_coloring = getPrivateInt(getSkinName(), "Visualizer analyzer coloring", 0);

	visualizer.setXmlParam("peaks", integerToString(show_peaks));
	visualizer.setXmlParam("peakfalloff", integerToString(p_falloffspeed));
	visualizer.setXmlParam("falloff", integerToString(a_falloffspeed));

	if (a_coloring == 0)
	{
		visualizer.setXmlParam("coloring", "Normal");
		if (!isShade) visualizer_m.setXmlParam("coloring", "Normal");
	}
	else if (a_coloring == 1)
	{
		visualizer.setXmlParam("coloring", "Normal");
		if (!isShade) visualizer_m.setXmlParam("coloring", "Normal");
	}
	else if (a_coloring == 2)
	{
		visualizer.setXmlParam("coloring", "Fire");
		if (!isShade) visualizer_m.setXmlParam("coloring", "Fire");
	}
	else if (a_coloring == 3)
	{
		visualizer.setXmlParam("coloring", "Line");
		if (!isShade) visualizer_m.setXmlParam("coloring", "Line");
	}

	if (!isShade)
	{
		visualizer_m.setXmlParam("peaks", integerToString(show_peaks));
		visualizer_m.setXmlParam("peakfalloff", integerToString(p_falloffspeed));
		visualizer_m.setXmlParam("falloff", integerToString(a_falloffspeed));		
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
			visualizer_m.setXmlParam("fliph", "0");			
		}
		else
		{
			visualizer.setXmlParam("fliph", "1");
			visualizer_m.setXmlParam("fliph", "1");			
		}
		return;
	}

	currentMode++;

	if (currentMode == 6)
	{
		currentMode = 0;
	}

	setVis	(currentMode);
	complete;
}

trigger.onRightButtonUp (int x, int y)
{
	visMenu = new PopUpMenu;
	specmenu = new PopUpMenu;
	oscmenu = new PopUpMenu;
	pksmenu = new PopUpMenu;
	anamenu = new PopUpMenu;
	stylemenu = new PopUpMenu;

	visMenu.addCommand("Presets:", 999, 0, 1);
	visMenu.addCommand("No Visualization", 100, currentMode == 0, 0);
	specmenu.addCommand("Thick Bands", 1, currentMode == 1, 0);
	specmenu.addCommand("Thin Bands", 2, currentMode == 2, 0);
	visMenu.addSubMenu(specmenu, "Spectrum Analyzer");

	oscmenu.addCommand("Solid", 3, currentMode == 3, 0);
	oscmenu.addCommand("Dots", 4, currentMode == 4, 0);
	oscmenu.addCommand("Lines", 5, currentMode == 5, 0);
	visMenu.addSubMenu(oscmenu, "Oscilloscope");

	visMenu.addSeparator();
	visMenu.addCommand("Options:", 102, 0, 1);
	visMenu.addCommand("Show Peaks", 101, show_peaks == 1, 0);
	pksmenu.addCommand("Slower", 200, p_falloffspeed == 0, 0);
	pksmenu.addCommand("Slow", 201, p_falloffspeed == 1, 0);
	pksmenu.addCommand("Moderate", 202, p_falloffspeed == 2, 0);
	pksmenu.addCommand("Fast", 203, p_falloffspeed == 3, 0);
	pksmenu.addCommand("Faster", 204, p_falloffspeed == 4, 0);
	visMenu.addSubMenu(pksmenu, "Peak Falloff Speed");
	anamenu.addCommand("Slower", 300, a_falloffspeed == 0, 0);
	anamenu.addCommand("Slow", 301, a_falloffspeed == 1, 0);
	anamenu.addCommand("Moderate", 302, a_falloffspeed == 2, 0);
	anamenu.addCommand("Fast", 303, a_falloffspeed == 3, 0);
	anamenu.addCommand("Faster", 304, a_falloffspeed == 4, 0);
	visMenu.addSubMenu(anamenu, "Analyzer Falloff Speed");
	stylemenu.addCommand("Normal", 400, a_coloring == 0, 0);
	stylemenu.addCommand("Fire", 402, a_coloring == 2, 0);
	stylemenu.addCommand("Line", 403, a_coloring == 3, 0);
	visMenu.addSubMenu(stylemenu, "Analyzer Coloring");

	ProcessMenuResult (visMenu.popAtMouse());

	delete visMenu;
	delete specmenu;
	delete oscmenu;
	delete pksmenu;
	delete anamenu;
	delete stylemenu;

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
		visualizer.setXmlParam("peaks", integerToString(show_peaks));
		if (!isShade) visualizer_m.setXmlParam("peaks", integerToString(show_peaks));
		setPrivateInt(getSkinName(), "Visualizer show Peaks", show_peaks);
	}

	else if (a >= 200 && a <= 204)
	{
		p_falloffspeed = a - 200;
		visualizer.setXmlParam("peakfalloff", integerToString(p_falloffspeed));
		if (!isShade) visualizer_m.setXmlParam("peakfalloff", integerToString(p_falloffspeed));
		setPrivateInt(getSkinName(), "Visualizer peaks falloff", p_falloffspeed);
	}

	else if (a >= 300 && a <= 304)
	{
		a_falloffspeed = a - 300;
		visualizer.setXmlParam("falloff", integerToString(a_falloffspeed));
		if (!isShade) visualizer_m.setXmlParam("falloff", integerToString(a_falloffspeed));
		setPrivateInt(getSkinName(), "Visualizer analyzer falloff", a_falloffspeed);
	}

	else if (a >= 400 && a <= 403)
	{
		a_coloring = a - 400;
		if (a_coloring == 0)
		{
			visualizer.setXmlParam("coloring", "Normal");
			if (!isShade) visualizer_m.setXmlParam("coloring", "Normal");
		}
		else if (a_coloring == 1)
		{
			visualizer.setXmlParam("coloring", "Normal");
			if (!isShade) visualizer_m.setXmlParam("coloring", "Normal");
		}
		else if (a_coloring == 2)
		{
			visualizer.setXmlParam("coloring", "Fire");
			if (!isShade) visualizer_m.setXmlParam("coloring", "Fire");
		}
		else if (a_coloring == 3)
		{
			visualizer.setXmlParam("coloring", "Line");
			if (!isShade) visualizer_m.setXmlParam("coloring", "Line");
		}
		setPrivateInt(getSkinName(), "Visualizer analyzer coloring", a_coloring);
	}
}

setVis (int mode)
{
	setPrivateInt(getSkinName(), "Visualizer Mode", mode);
	if (mode == 0)
	{
		visualizer.setMode(0);
		if (!isShade) visualizer_m.setMode(0);
	}
	else if (mode == 1)
	{
		visualizer.setXmlParam("bandwidth", "wide");
		visualizer.setMode(1);
		if (!isShade) visualizer_m.setXmlParam("bandwidth", "wide");
		if (!isShade) visualizer_m.setMode(1);
	}
	else if (mode == 2)
	{
		visualizer.setXmlParam("bandwidth", "thin");
		visualizer.setMode(1);
		if (!isShade) visualizer_m.setXmlParam("bandwidth", "thin");
		if (!isShade) visualizer_m.setMode(1);
	}
	else if (mode == 3)
	{
		visualizer.setXmlParam("oscstyle", "solid");
		visualizer.setMode(2);
		if (!isShade) visualizer_m.setXmlParam("oscstyle", "solid");
		if (!isShade) visualizer_m.setMode(2);
	}
	else if (mode == 4)
	{
		visualizer.setXmlParam("oscstyle", "dots");
		visualizer.setMode(2);
		if (!isShade) visualizer_m.setXmlParam("oscstyle", "dots");
		if (!isShade) visualizer_m.setMode(2);
	}
	else if (mode == 5)
	{
		visualizer.setXmlParam("oscstyle", "lines");
		visualizer.setMode(2);
		if (!isShade) visualizer_m.setXmlParam("oscstyle", "lines");
		if (!isShade) visualizer_m.setMode(2);
	}
	currentMode = mode;
}

// Set Vis reflection on/off

vis_reflection_attrib.onDataChanged ()
{
	if (isShade)
	{
		// shade visualizer doesn't have a reflection
		return;
	}

	if (getdata() == "1")
	{
		visualizer_m.show();
	}
	else
	{
		visualizer_m.hide();
	}		
}

// Set Timer reflection on/off

timer_reflection_attrib.onDataChanged ()
{
	if (isShade)
	{
		// shade visualizer doesn't have a reflection
		return;
	}

	if (getdata() == "1")
	{
		tmr.setXmlParam("font", "player.bitmapfont.nums");
	}
	else
	{
		tmr.setXmlParam("font", "player.bitmapfont.nums.noreflect");
	}			
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