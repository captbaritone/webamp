/*---------------------------------------------------
-----------------------------------------------------
Filename:	show_hide.m
Version:	1.0

Type:		maki
Date:		29. Nov. 2006 - 15:57 
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

switchToCover ()
{
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;
	tempDisable.start();
	hideVis();
	hideVis_Full();
	hideEq();
	hideCfg();
	openIC();
	_Plsc_hide();
#ifdef IC_COVERFLOW
	_Cflow_hide();
#endif
	mychange = 1;
	if (startup_done)
	{
		ic_cover_fileinfo.setData("1");
		ic_fileinfo.setData("1");
	}
	mychange = 0;
	substract = 0;
	sui_cover.setXmlParam("x", "4");

	dualwnd.setXmlParam("maxwidth", "-127");
	dualwnd.sendAction("set_maxwidth", "", -127, 0 , 0, 0);

	g_footer.setXmlParam("x", "117");
	g_footer.setXmlParam("w", "-118");

	updateFooter();

#ifdef DOHIDEMCV
	dualwnd.setXmlParam("from", "right");
	dualwnd.setXmlParam("minwidth", "147");
#endif	
	showCover();
	FIT_W_COMP;
	updateSaving(1);
}

switchToVisCover ()
{
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;
	tempDisable.start();
	hideVis_Full();
	hideEq();
	hideCfg();
	openIC();
	_Plsc_hide();
#ifdef IC_COVERFLOW
	_Cflow_hide();
#endif
	mychange = 1;
	if (startup_done)
	{
		ic_cover_fileinfo.setData("1");
		ic_vis_fileinfo.setData("1");
		vis_lefttoplayer_attrib.setData("1");
		ic_fileinfo.setData("1");
	}
	mychange = 0;
	substract = 0;
	sui_cover.setXmlParam("x", "119");

	dualwnd.setXmlParam("maxwidth", "-242");
	dualwnd.sendAction("set_maxwidth", "", -242, 0 , 0, 0);
	
	g_footer.setXmlParam("x", "232");
	g_footer.setXmlParam("w", "-234");

	updateFooter();

#ifdef DOHIDEMCV
	dualwnd.setXmlParam("from", "right");
	dualwnd.setXmlParam("minwidth", "147");
#endif	
	showCover();
	showVis();
	FIT_W2_COMP;
	updateSaving(1);
}
switchToVis ()
{
	debugString(DEBUG_PREFIX "switchToVis();", D_WTF);
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;
	tempDisable.start();
	hideCover();
	hideVis_Full();
	hideEq();
	hideCfg();
	openIC();
	_Plsc_hide();
#ifdef IC_COVERFLOW
	_Cflow_hide();
#endif
	mychange = 1;
	if (startup_done)
	{
		ic_vis_fileinfo.setData("1");
		vis_lefttoplayer_attrib.setData("1");
		ic_fileinfo.setData("1");
	}
	mychange = 0;
	substract = 1;

	dualwnd.setXmlParam("maxwidth", "-127");
	dualwnd.sendAction("set_maxwidth", "", -127, 0 , 0, 0);	

	g_footer.setXmlParam("x", "117");
	g_footer.setXmlParam("w", "-118");

	updateFooter();

#ifdef DOHIDEMCV
	dualwnd.setXmlParam("from", "right");
	dualwnd.setXmlParam("minwidth", "147");
#endif	
	showVis();
	FIT_W_COMP;
	updateSaving(1);
}

switchToIcOnly ()
{
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;
	tempDisable.start();
	hideVis_Full();
	hideVis();
	hideCover();
	hideEq();
	hideCfg();
	_Plsc_hide();
#ifdef IC_COVERFLOW
	_Cflow_hide();
#endif
	mychange = 1;
	if (startup_done) ic_fileinfo.setData("1");
	//ic_vis_fileinfo.setData("0");
	//ic_vis.setData("0");
	mychange = 0;
	substract = 0;

	dualwnd.setXmlParam("maxwidth", "-127");
	dualwnd.sendAction("set_maxwidth", "", -127, 0 , 0, 0);

	g_footer.setXmlParam("x", "6");
	g_footer.setXmlParam("w", "-7");

	updateFooter();

#ifdef DOHIDEMCV
	dualwnd.setXmlParam("from", "right");
	dualwnd.setXmlParam("minwidth", "147");
#endif	
	showFi();
	FIT_WO_COMP;
	updateSaving(1);
}

switchToEq ()
{	debugString("switc2eq @cbTimerRun="+integerToString(callbackTimer.isRunning()), 9);
	debugString("switc2eq @tempDisableRun="+integerToString(tempDisable.isRunning()), 9);
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;
	tempDisable.start();
	hideVis_Full();
	hideVis();
	hideCover();
	hideFi();
	hideCfg();
	_Plsc_hide();
#ifdef IC_COVERFLOW
	_Cflow_hide();
#endif
	mychange = 1;
	substract = 1;
	ic_eq.setData("1");
	//ic_vis_fileinfo.setData("0");
	//ic_vis.setData("0");
	mychange = 0;

	dualwnd.setXmlParam("maxwidth", "-196");
	dualwnd.sendAction("set_maxwidth", "", -196, 0 , 0, 0);	

	g_footer.setXmlParam("x", "6");
	g_footer.setXmlParam("w", "-7");

	updateFooter();

#ifdef DOHIDEMCV
	dualwnd.setXmlParam("from", "right");
	dualwnd.setXmlParam("minwidth", "147");
#endif	

	showEq();
	updateSaving(4);
	debugString("switc2eq finished", 9);
}

switchToCfg ()
{
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;
	tempDisable.start();
	hideVis_Full();
	hideVis();
	hideCover();
	hideFi();
	hideEq();
	_Plsc_hide();
#ifdef IC_COVERFLOW
	_Cflow_hide();
#endif
	mychange = 1;
	ic_config.setData("1");
	//ic_vis_fileinfo.setData("0");
	//ic_vis.setData("0");
	mychange = 0;
	substract = 2;	

	dualwnd.setXmlParam("maxwidth", "-242");
	dualwnd.sendAction("set_maxwidth", "", -242, 0 , 0, 0);

	g_footer.setXmlParam("x", "6");
	g_footer.setXmlParam("w", "-7");

	updateFooter();

#ifdef DOHIDEMCV
	dualwnd.setXmlParam("from", "right");
	dualwnd.setXmlParam("minwidth", "147");
#endif	

	showCfg();
	updateSaving(5);
}

_Plsc_switchTo ()
{
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;
	tempDisable.start();
	hideVis_Full();
	hideVis();
	hideCover();
	hideFi();
	hideEq();
	hideCfg();
#ifdef IC_COVERFLOW
	_Cflow_hide();
#endif
	mychange = 1;
	_plsc_ic_attrib.setData("1");
	//ic_vis_fileinfo.setData("0");
	//ic_vis.setData("0");
	mychange = 0;
	substract = 0;
	
	dualwnd.setXmlParam("maxwidth", "-156");
	dualwnd.sendAction("set_maxwidth", "", -156, 0 , 0, 0);

	g_footer.setXmlParam("x", "6");
	g_footer.setXmlParam("w", "-7");

	updateFooter();

#ifdef DOHIDEMCV
	dualwnd.setXmlParam("from", "right");
	dualwnd.setXmlParam("minwidth", "147");
#endif	

	_Plsc_show();
	updateSaving(3);
}

#ifdef IC_COVERFLOW
_Cflow_switchTo ()
{
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;
	tempDisable.start();
	hideVis_Full();
	hideVis();
	hideCover();
	hideFi();
	hideEq();
	hideCfg();
	_Plsc_hide();
	mychange = 1;
	_cflow_ic_attrib.setData("1");
	//ic_vis_fileinfo.setData("0");
	//ic_vis.setData("0");
	mychange = 0;
	substract = 0;

	dualwnd.setXmlParam("maxwidth", "-156");
	dualwnd.sendAction("set_maxwidth", "", -156, 0 , 0, 0);

	g_footer.setXmlParam("x", "6");
	g_footer.setXmlParam("w", "-7");

	updateFooter();

#ifdef DOHIDEMCV
	dualwnd.setXmlParam("from", "right");
	dualwnd.setXmlParam("minwidth", "147");
#endif	

	_Cflow_show();
	updateSaving(3);
}
#endif

switchToVis_Full ()
{
	debugString(DEBUG_PREFIX "switchToVis_FULL();", D_WTF);
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;
	tempDisable.start();
	closeIC();
	hideVis();
	hideCover();
	hideEq();
	//hideFi();
	hideCfg();
	_Plsc_hide();
#ifdef IC_COVERFLOW
	_Cflow_hide();
#endif
	mychange = 1;
	ic_vis.setData("1");
	vis_lefttoplayer_full_attrib.setData("1");
	mychange = 0;
	substract = 1;

	dualwnd.setXmlParam("maxwidth", "-196");
	dualwnd.sendAction("set_maxwidth", "", -196, 0 , 0, 0);

	g_footer.setXmlParam("x", "6");
	g_footer.setXmlParam("w", "-7");

	updateFooter();

#ifdef DOHIDEMCV
	dualwnd.setXmlParam("from", "right");
	dualwnd.setXmlParam("minwidth", "147");
#endif	
	showVis_Full();
	updateSaving(2);
}

#ifdef DOHIDEMCV
hideMCV ()
{
	debugString(DEBUG_PREFIX "hideMCV();", D_WTF);
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;
	tempDisable.start();
	hideVis_Full();
	closeIC();
	hideVis();
	hideCover();
	hideEq();
	//hideFi();
	hideCfg();
	_Plsc_hide();
#ifdef IC_COVERFLOW
	_Cflow_hide();
#endif
	mychange = 1;
	ic_hidden.setData("1");
	mychange = 0;
	updateSaving(0);
	/*g_footer.setXmlParam("x", "6");
	g_footer.setXmlParam("w", "-7");
	dualwnd.setXmlParam("maxwidth", "-156");
	dualwnd.sendAction("set_maxwidth", "", -156, 0 , 0, 0);*/
//	dualwnd.setXmlParam("maxwidth", "-8");
//	dualwnd.sendAction("set_maxwidth", "", -8, 0 , 0, 0);
	dualwnd.setXmlParam("from", "left");
	dualwnd.setXmlParam("minwidth", integerToString(8 - stringtoInteger(dualwnd.getXmlParam("maxwidth"))));
	dualwnd.setXmlParam("maxwidth", "-155");
	dualwnd.sendAction("set_maxwidth", "", -155, 0 , 0, 0);
	dualwnd.setPosition(0);
	updateSaving(6);
}
#endif

tempDisable.onTimer()
{
	stop();
}

closeLC ()
{
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;
	tempDisable.start();
	hideVis();
	hideCover();
	hideCfg();
	hideEq();
	hideVis_Full();
	_Plsc_hide();
#ifdef IC_COVERFLOW
	_Cflow_hide();
#endif
}

closeIC ()
{
	debugString(DEBUG_PREFIX "closeIC() {", 0);

	hideFi();

	onCloseIC();

	debugString(DEBUG_PREFIX "}", 0);
}

openIC ()
{
	debugString(DEBUG_PREFIX "openIC() {", 0);

	showFi();

	onOpenIC();

	debugString(DEBUG_PREFIX "}", 0);
}

showFi()
{
	debugString(DEBUG_PREFIX "showFi() {", 0);

	showing_fi = 1;
	setPrivateString(getSkinName(), "Component3", "File Info");
	GuiObject o = sui_fi;
	if (o != NULL)
	{ 
		bypasscancel = 1;
		if (o) o.show();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   --> ok", 0);
	}
#ifdef DEBUG
	else debugString(DEBUG_PREFIX "   -->  (!)  fi object not provided (show)", 0);
#endif
	onShowFi();
	showing_Fi = 0;

	debugString(DEBUG_PREFIX "}", 0);
}

hideFi()
{
	debugString(DEBUG_PREFIX "hideFi() {", 0);

	hiding_Fi = 1;
	GuiObject o = sui_fi;
	if (o != NULL) { 
		bypasscancel = 1;
		if (o) o.hide();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   -->  ok", 0);
	}
#ifdef DEBUG
	else debugString(DEBUG_PREFIX "   -->  (!)  sfi object not provided (hide)", 0);
#endif
	onHideFi();
	hiding_Fi = 0;

	debugString(DEBUG_PREFIX "}", 0);
}

showVis()
{
	//if (vis_inbig_attrib.getData() == "1") return;
	debugString(DEBUG_PREFIX "showVis() {", D_WTF);
	showing_vis = 1;
	GuiObject o = sui_vis;
	if (o != NULL)
	{ 
		bypasscancel = 1;
		if (o) o.show();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   --> ok", D_WTF);
	}
#ifdef DEBUG
	else debugString(DEBUG_PREFIX "   -->  (!)  vis object not provided (show)", D_WTF);
#endif
	onShowVis();
	showing_vis = 0;

	debugString(DEBUG_PREFIX "}", D_WTF);
}

hideVis()
{
	debugString(DEBUG_PREFIX "hideVis() {", D_WTF);

	hiding_vis = 1;
	GuiObject o = sui_vis;
	if (o != NULL) { 
		bypasscancel = 1;
		if (o) o.hide();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   -->  ok", D_WTF);
	}
#ifdef DEBUG
	else debugString(DEBUG_PREFIX "   -->  (!)  vis object not provided (hide)", D_WTF);
#endif
	onHideVis();
	hiding_vis = 0;

	debugString(DEBUG_PREFIX "}", D_WTF);
}

showCover()
{
	debugString(DEBUG_PREFIX "showCover() {", 0);

	showing_Cover = 1;
	GuiObject o = sui_Cover;
	if (o != NULL)
	{ 
		bypasscancel = 1;
		if (o) o.show();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   --> ok", 0);
	}
#ifdef DEBUG
	else debugString(DEBUG_PREFIX "   -->  (!)  Cover object not provided (show)", 0);
#endif
	onShowCover();
	showing_Cover = 0;

	debugString(DEBUG_PREFIX "}", 0);
}

hideCover()
{
	debugString(DEBUG_PREFIX "hideCover() {", 0);

	hiding_Cover = 1;
	GuiObject o = sui_Cover;
	if (o != NULL) { 
		bypasscancel = 1;
		if (o) o.hide();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   -->  ok", 0);
	}
#ifdef DEBUG
	else debugString(DEBUG_PREFIX "   -->  (!)  Cover object not provided (hide)", 0);
#endif
	onHideCover();
	hiding_Cover = 0;

	debugString(DEBUG_PREFIX "}", 0);
}

showVis_Full()
{
	debugString(DEBUG_PREFIX "showVis_Full() {", D_WTF);

	showing_vis_full = 1;
	GuiObject o = sui_vis_full;
	if (o != NULL)
	{ 
		bypasscancel = 1;
		if (o) o.show();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   --> ok", D_WTF);
	}
#ifdef DEBUG
	else debugString(DEBUG_PREFIX "   -->  (!)  Vis_Full object not provided (show)", D_WTF);
#endif
	onShowVis_Full();
	showing_vis_full = 0;

	debugString(DEBUG_PREFIX "}", D_WTF);
}

hideVis_Full()
{
	debugString(DEBUG_PREFIX "hideVis_Full() {", D_WTF);

	hiding_vis_full = 1;
	GuiObject o = sui_vis_full;
	if (o != NULL) { 
		bypasscancel = 1;
		if (o) o.hide();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   -->  ok", D_WTF);
	}
#ifdef DEBUG
	else debugString(DEBUG_PREFIX "   -->  (!)  Vis_Full object not provided (hide)", D_WTF);
#endif
	onHideVis_Full();
	hiding_vis_full = 0;

	debugString(DEBUG_PREFIX "}", D_WTF);
}

showEq()
{
	debugString(DEBUG_PREFIX "showEq() {", D_WTF);

	showing_eq = 1;
	GuiObject o = sui_eq;
	if (o != NULL)
	{ 
		bypasscancel = 1;
		if (o) o.show();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   --> ok", D_WTF);
	}
#ifdef DEBUG
	else debugString(DEBUG_PREFIX "   -->  (!)  Vis_Full object not provided (show)", D_WTF);
#endif
	onShowEq();
	showing_eq = 0;

	debugString(DEBUG_PREFIX "}", D_WTF);
}

hideEq()
{
	debugString(DEBUG_PREFIX "hideVis_Full() {", D_WTF);

	hiding_eq = 1;
	GuiObject o = sui_eq;
	if (o != NULL) { 
		bypasscancel = 1;
		if (o) o.hide();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   -->  ok", D_WTF);
	}
#ifdef DEBUG
	else debugString(DEBUG_PREFIX "   -->  (!)  Eq object not provided (hide)", D_WTF);
#endif
	onHideEq();
	hiding_eq = 0;

	debugString(DEBUG_PREFIX "}", D_WTF);
}

showCfg()
{
	debugString(DEBUG_PREFIX "showCfg() {", D_WTF);

	showing_cfg = 1;
	GuiObject o = sui_cfg;
	if (o != NULL)
	{ 
		bypasscancel = 1;
		if (o) o.show();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   --> ok", D_WTF);
	}
#ifdef DEBUG
	else debugString(DEBUG_PREFIX "   -->  (!)  cfg_Full object not provided (show)", D_WTF);
#endif
	onShowcfg();
	showing_cfg = 0;

	debugString(DEBUG_PREFIX "}", D_WTF);
}

hideCfg()
{
	debugString(DEBUG_PREFIX "hideVis_Full() {", D_WTF);

	hiding_cfg = 1;
	GuiObject o = sui_cfg;
	if (o != NULL) { 
		bypasscancel = 1;
		if (o) o.hide();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   -->  ok", D_WTF);
	}
#ifdef DEBUG
	else debugString(DEBUG_PREFIX "   -->  (!)  cfg object not provided (hide)", D_WTF);
#endif
	onHidecfg();
	hiding_cfg = 0;

	debugString(DEBUG_PREFIX "}", D_WTF);
}

callbackTimer.onTimer()
{
	callbackTimer.stop();

	debugString(DEBUG_PREFIX "callbackTimer();", D_WTF);

	int _callback_showing_vis = callback_showing_vis;
	int _callback_hiding_vis = callback_hiding_vis;
	int _callback_showing_fi = callback_showing_fi;
	int _callback_hiding_fi = callback_hiding_fi;
	int _callback_showing_cover = callback_showing_cover;
	int _callback_hiding_cover = callback_hiding_cover;
	int _callback_showing_vis_full = callback_showing_vis_full;
	int _callback_hiding_vis_full = callback_hiding_vis_full;
	int _callback_showing_eq = callback_showing_eq;
	int _callback_hiding_eq = callback_hiding_eq;
	int _callback_showing_cfg = callback_showing_cfg;
	int _callback_hiding_cfg = callback_hiding_cfg;
	int _plsc_callback_showing_temp = _plsc_callback_showing;
	int _plsc_callback_hiding_temp = _plsc_callback_hiding;
#ifdef IC_COVERFLOW
	int _cflow_callback_showing_temp = _cflow_callback_showing;
	int _cflow_callback_hiding_temp = _cflow_callback_hiding;
#endif

	callback_showing_vis = 0;
	callback_hiding_vis = 0;
	callback_showing_fi = 0;
	callback_hiding_fi = 0;
	callback_showing_cover = 0;
	callback_hiding_cover = 0;
	callback_showing_vis_full = 0;
	callback_hiding_vis_full = 0;
	callback_showing_eq = 0;
	callback_hiding_eq = 0;
	callback_showing_cfg = 0;
	callback_hiding_cfg = 0;
	_plsc_callback_showing = 0;
	_plsc_callback_hiding = 0;
#ifdef IC_COVERFLOW
	_cflow_callback_showing = 0;
	_cflow_callback_hiding = 0;
#endif

	if (_callback_showing_vis == 1)
	{
		ic_vis_fileinfo.setData("1");
		ic_fileinfo.setData("1");
	}
	if (_callback_hiding_vis == 1)
	{
		ic_vis_fileinfo.setData("0");
	}
	if (_callback_showing_fi == 1)
	{
		showFi();
	}
	if (_callback_hiding_fi == 1)
	{
		hideFi();
	}
	if (_callback_showing_cover == 1)
	{
		ic_cover_fileinfo.setData("1");
		ic_fileinfo.setData("1");
	}
	if (_callback_hiding_cover == 1)
	{
		ic_cover_fileinfo.setData("0");
	}
	if (_callback_showing_vis_full == 1)
	{
		switchToVis_Full();
	}
	if (_callback_hiding_vis_full == 1)
	{
		hideVis_Full();
	}
	if (_callback_showing_eq == 1)
	{
		switchToEq();
	}
	if (_callback_hiding_eq == 1)
	{
		hideEq();
	}
	if (_callback_showing_cfg == 1)
	{
		switchTocfg();
	}
	if (_callback_hiding_cfg == 1)
	{
		hidecfg();
	}
	if (_plsc_callback_showing_temp == 1)
	{
		_Plsc_switchTo();
	}
	if (_plsc_callback_hiding_temp == 1)
	{
		_Plsc_hide();
	}
#ifdef IC_COVERFLOW
	if (_cflow_callback_showing_temp == 1)
	{
		_Cflow_switchTo();
	}
	if (_cflow_callback_hiding_temp == 1)
	{
		_Cflow_hide();
	}
#endif
}

dc_showFi ()
{
	callback_showing_fi = 1;
	callback_hiding_fi = 0;
	callbackTimer.start();
}

dc_hideFi ()
{
	callback_showing_fi = 0;
	callback_hiding_fi = 1;
	callbackTimer.start();
}

dc_showCover ()
{
	callback_showing_cover = 1;
	callback_hiding_cover = 0;
	callbackTimer.start();
}

dc_hideCover ()
{
	callback_showing_cover = 0;
	callback_hiding_cover = 1;
	callbackTimer.start();
}

dc_showVis ()
{
	debugString(DEBUG_PREFIX "dc_showVis();", D_WTF);
	callback_showing_vis = 1;
	callback_hiding_vis = 0;
	callbackTimer.start();
}

dc_hideVis ()
{
	callback_showing_vis = 0;
	callback_hiding_vis = 1;
	callbackTimer.start();
}

dc_showVis_Full ()
{
	debugString(DEBUG_PREFIX "dc_showVis_Full();", D_WTF);
	callback_showing_vis_full = 1;
	callback_hiding_vis_full = 0;
	callbackTimer.start();
}

dc_hideVis_Full ()
{
	callback_showing_vis_full = 0;
	callback_hiding_vis_full = 1;
	callbackTimer.start();
}

dc_showEq ()
{
	debugString(DEBUG_PREFIX "dc_showVis_Full();", D_WTF);
	callback_showing_eq = 1;
	callback_hiding_eq = 0;
	callbackTimer.start();
}

dc_hideEq ()
{
	callback_showing_eq = 0;
	callback_hiding_eq = 1;
	callbackTimer.start();
}

dc_showCfg ()
{
	debugString(DEBUG_PREFIX "dc_showVis_Full();", D_WTF);
	callback_showing_Cfg = 1;
	callback_hiding_Cfg = 0;
	callbackTimer.start();
}

dc_hideCfg ()
{
	callback_showing_Cfg = 0;
	callback_hiding_Cfg = 1;
	callbackTimer.start();
}