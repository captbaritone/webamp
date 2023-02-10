/*---------------------------------------------------
-----------------------------------------------------
Filename:	load_handles.m

Type:		maki
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
Depending Files:
		scripts/suicore.maki
-----------------------------------------------------
---------------------------------------------------*/

#ifndef included
#error This script can only be compiled as a #include
#endif

Function loadSUI (string content);
Function collectComponents();

Global timer tmr_collect;

System.onScriptLoaded ()
{
	startup = 1;
	initAttribs_windowpage();
	initAttribs_vis();
	initAttribs_Autoresize();
	initVideo();
	debugString(DEBUG_PREFIX "-------------------------", D_WTF);
	debugString(DEBUG_PREFIX "System.onScriptLoded()  {", D_WTF);

	/*debugString(integerToString(isNamedWindowVisible(ML_GUID)),9);
	showWindow(ML_GUID, "", 0);
	debugString(integerToString(isNamedWindowVisible(ML_GUID)),9);*/

	player = getContainer("main");
	normal = player.getLayout("normal");
	sui_window = normal.findObject("sui.content");
	sui_components = sui_window.findObject("sui.components");

	h = getToken(getParam(),",",0);

	sui_vis = sui_components.findObject("wdh.vis");
	sui_video = sui_components.findObject("wdh.video");
	sui_ml = sui_components.findObject("wdh.ml");
	sui_brw = sui_components.findObject("wdh.browser");
	//--sui_exp = sui_components.findObject("wdh.explorer");
	//--sui_cfg = sui_components.findObject("wdh.config");

	switch_video = sui_window.findObject("switch.video");
	switch_vis = sui_window.findObject("switch.vis");
	switch_ml = sui_window.findObject("switch.ml");
	//--switch_exp = sui_window.findObject("switch.explorer");
	switch_brw = sui_window.findObject("switch.browser");
	//--switch_cfg = sui_window.findObject("switch.config");

	hide_sui = normal.getObject("sui.hide");
	show_sui = normal.getObject("sui.show");
/*
	b_maximize = normal.findObject("player.button.maximize");
	b_minimize = normal.findObject("player.button.minimize");
	b_shade = normal.findObject("player.button.shade");
*/
	normal_resizer = normal.getObject("player.resizer.bottomright.dummy");
	normal_resizer2 = normal.getObject("player.resizer.bottomleft");
	normal_resizer3 = normal.getObject("player.resizer.bottom");
	normal_resizer4 = normal.getObject("player.resizer.bottom2");

	normal_TBresizer = normal.findObject("titlebar.resizer.topright");
	normal_TBresizer2 = normal.findObject("titlebar.resizer.topleft");
	normal_TBresizer3 = normal.findObject("titlebar.resizer.top");

	callbackTimer = new Timer;
	callbackTimer.setDelay(1);
	tempDisable = new Timer;
	tempDisable.setDelay(100);

	tmr_collect = new timer;
	tmr_collect.setDelay(2000);
	//tmr_collect.start();

	//collectComponents();

	String window_content =  getPrivateString(getSkinName(), "Component", "Media Library");

	debugString(DEBUG_PREFIX "window_content = " + window_content, D_WTF);

	loadSUI(window_content);

	debugString(DEBUG_PREFIX "}", D_WTF);
	startup = 0;
}

System.onScriptUnloading ()
{
	debugString(DEBUG_PREFIX "System.onScriptUnloading()  {", D_NWTF);

	delete callbackTimer;
	delete PSOVCTimer;
	delete tempDisable;
	delete tmr_collect;

	debugString(DEBUG_PREFIX "   delete Timers;", D_NWTF);
	debugString(DEBUG_PREFIX "}", D_NWTF);
}

loadSUI (string content)
{
	if (content == "Vis")
	{
		debugString(DEBUG_PREFIX "if(Vis) performed", D_WTF);
		Mychange = 1;
		vis_inbig_attrib.setData("1");
		Mychange = 0;
		switchToVis();
	}
	else if (content == "Video")
	{
		debugString(DEBUG_PREFIX "if(Video) performed", D_WTF);
		switchToVideo();
	}
	else if (content == "Media Library")
	{
		debugString(DEBUG_PREFIX "if(ML) performed", D_WTF);
		switchToMl();
	}
	else if (content == "Browser")
	{
		debugString(DEBUG_PREFIX "if(Browser) performed", D_WTF);
		switchToBrw();
	}/*--
	else if (content == "Explorer")
	{
		debugString(DEBUG_PREFIX "if(Explorer) performed", D_WTF);
		switchToExp();
	}--*/
	/*--else if (content == "Config")
	{
		debugString(DEBUG_PREFIX "if(Config) performed", D_WTF);
		switchToCfg();
	}--*/
	else if (content == "Hidden")
	{
		debugString(DEBUG_PREFIX "if(Hidden) performed", D_WTF);
		switchToNoComp();
	}
	else
	{
		debugString(DEBUG_PREFIX "[!] oops no component to perform", D_WTF);
	}
}
/*
collectComponents()
{
	for ( int i = 0; i < getNumRegisteredWindows(); i++ )
	{
		debug((getRegisteredWindowName(i)));
	}
	
}
*/
/*
collectComponents ()
{
	int i = 0;
	string s;
	while (s = enumEmbedGUID(i) != "")
	{
		debug (s);
		i++;
	}
	if (i == 0 && !tmr_collect.isRunning())
	{
		tmr_collect.start();
	//}
}*/
/*
tmr_collect.onTimer ()
{
	tmr_collect.stop();
	debug(getRegisteredWindowName(0));
	
	collectComponents();
}
*/
/*
player.onAddContent(GuiObject wnd, String id, String guid)
{
	debug(wnd.getName());
	debug(id);
//	debug(guid);
}*/
/*
sui_ml.onsetVisible(int v)
{
	windowholder w = findObject("wdh");
	debug(w.getGUID());
	GuiObject o = w.getContent();
	debug(o.getId());
	debug(o.getName());
}*/
/*
System.onCreateLayout (Layout _layout)
{
	debug(_layout.getId());
}*/
