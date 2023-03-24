/*---------------------------------------------------
-----------------------------------------------------
Filename:	load_handles.m
Version:	1.0

Type:		maki
Date:		28. Dez. 2006 - 08:40 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
Depending Files:
		scripts/infocompcore.maki
-----------------------------------------------------
---------------------------------------------------*/

#ifndef included
#error This script can only be compiled as a #include
#endif

System.onScriptLoaded ()
{
	initAttribs_windowpage();
	initAttribs_vis();

	debugString(DEBUG_PREFIX "System.onScriptLoded()  {", 0);

	sg = getScriptGroup();
	main = sg.getParentLayout();

	if (getParam() == "big")
	{
		mainframe = main.getObject("player.mainframe.big");
	}
	else
	{
		mainframe = main.getObject("player.mainframe");
	}	

	dualwnd = mainframe.findObject("player.dualwnd");

	sui_cover = sg.findObject("info.component.cover");
	sui_vis = sg.findObject("info.component.vis");
	sui_vis_full = sg.findObject("info.component.vis.full");
	sui_fi = sg.findObject("info.component.infodisplay");
	sui_eq = sg.findObject("info.component.eq");
	sui_cfg = sg.findObject("info.component.config");
	_plsc_sui = sg.findObject("info.component.plsidecar");
#ifdef IC_COVERFLOW
	_cflow_sui = sg.findObject("info.component.coverflow");
#endif
	g_footer = sg.findObject("infocomp.background.footer");
	g_visbtns = g_footer.findObject("infocomp.visbuttons");
	footerGrid = g_footer.findObject("footer.background.grid");

	compChoose = sg.findObject("comp.menu");
	sendToBtn = sg.findObject("sendTo");
	nowPlayingBtn = sg.findObject("nowplaying");
	webSearchBtn = sg.findObject("search");
#ifdef DOHIDEMCV
	last_menu_sel = getPrivateInt(getSkinName(), "MCV last sel", 1);
#endif
	callbackTimer = new Timer;
	callbackTimer.setDelay(1);
	tempDisable = new Timer;
	tempDisable.setDelay(50);


	if (ic_fileinfo.getData() == "1")
	{
		updateFileInfo ();
	}
	else if (ic_vis.getData() == "1")
	{
		switchToVis_Full();
	}
	else if (ic_eq.getData() == "1")
	{
		switchToEq();
	}
	else if (ic_config.getData() == "1")
	{
		switchToCfg();
	}
	else if (_plsc_ic_attrib.getData() == "1")
	{
		_plsc_switchTo();
	}
#ifdef IC_COVERFLOW
	else if (_cflow_ic_attrib.getData() == "1")
	{
		_cflow_switchTo();
	}
#endif
#ifdef DOHIDEMCV
	else if (ic_hidden.getData() == "1")
	{
		hideMCV();
	}
#endif
	startup_done = 1;
	debugString(DEBUG_PREFIX "}", 0);
	prevent_vis = 0;
}

updateFileInfo ()
{
	if (ic_vis_fileinfo.getData() == "1" && ic_cover_fileinfo.getData() == "1")
	{
		switchToVisCover();
	}
	else if (ic_vis_fileinfo.getData() == "1")
	{
		switchToVis();
	}
	else if (ic_cover_fileinfo.getData() == "1")
	{
		switchToCover();
	}
	else
	{
		switchToIcOnly();
	}
}

System.onScriptUnloading ()
{
	debugString(DEBUG_PREFIX "System.onScriptUnloading()  {", 0);

	delete callbackTimer;
	delete tempDisable;

	debugString(DEBUG_PREFIX "   delete Timers;", 0);
	debugString(DEBUG_PREFIX "}", 0);
}