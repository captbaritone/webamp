/*---------------------------------------------------
-----------------------------------------------------
Filename:	show_hide.m

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

switchToMl()
{
	debugString(DEBUG_PREFIX "switchToMl() {", D_WTF);
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;
	tempDisable.start();
	disablePSOVC();
	hideVis();
	hideVideo();
	//--hideExp();
	hideBrw();
	//--hideCfg();
	//prohibit a closing bug
	if (!startup) showMl();
	else
	{
		dc_showMl();
		onshowMl();
	}
	debugString(DEBUG_PREFIX "}", D_WTF);

	hide_sui.show();
	show_sui.hide();
}

switchToVideo()
{
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;
	tempDisable.start();
	hideMl();
	hideVis();
	//--hideExp();
	hideBrw();
	//--hideCfg();
	showVideo();

	hide_sui.show();
	show_sui.hide();
}

switchToVis()
{
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;
	tempDisable.start();
	disablePSOVC();
	hideMl();
	hideVideo();
	//--hideExp();
	hideBrw();
	//--hideCfg();
	showVis();

	hide_sui.show();
	show_sui.hide();
}

switchToBrw()
{
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;
	tempDisable.start();
	disablePSOVC();
	hideVis();
	hideVideo();
	//--hideExp();
	hideMl();
	//--hideCfg();
	showBrw();

	hide_sui.show();
	show_sui.hide();
}
/*--
switchToExp()
{
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;
	tempDisable.start();
	disablePSOVC();
	hideVis();
	hideVideo();
	hideMl();
	hideBrw();
	//--hideCfg();
	showExp();

	hide_sui.show();
	show_sui.hide();
}
--*/
/*--switchToCfg()
{
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;
	tempDisable.start();
	disablePSOVC();
	hideVis();
	hideVideo();
	hideMl();
	hideBrw();
	hideExp();
	showCfg();

	hide_sui.show();
	show_sui.hide();
}--*/

switchToNoComp ()
{
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;
	tempDisable.start();
	disablePSOVC();

	onBeforeHideSUI();

	hideVis();
	hideVideo();
	hideMl();
	hideBrw();
	//--hideExp();
	//--hideCfg();

	string comp = getPrivateString(getSkinName(), "Component", "Media Library");
	if (comp != "Hidden")
	{
		normal.sendAction("sui", "tonocomp", 0,0,0,0);
		setPrivateString(getSkinName(), "Hidden Component", comp);
		setPrivateString(getSkinName(), "Component", "Hidden");
		if (!getPrivateInt(getSkinName(), "isMainWndMaximized", 0)) setPrivateInt(getSkinName(), "nomax_h", normal.getHeight());
	}
	else normal.sendAction("sui", "tonocomp", 1,0,0,0);
	
	normal_resizer.setXmlParam("resize", "right");
	normal_resizer2.setXmlParam("resize", "left");
	normal_resizer3.setXmlParam("resize", "");
	normal_resizer4.setXmlParam("resize", "");
	normal_TBresizer.setXmlParam("resize", "right");
	normal_TBresizer2.setXmlParam("resize", "left");
	normal_TBresizer3.hide();
	normal.setXmlParam("minimum_h" , h);
	
	int sy = normal.getGuiY() + normal.getGuiH() - stringtointeger(h);
	normal.setXmlParam("h" , h);
	if (collapse_bottom_attrib.getdata() == "1") normal.setXmlParam("y" , integerToString(sy));

	hide_sui.hide();
	show_sui.show();

	onHideSUI();
}

switchFromNoComp ()
{
	if (callbackTimer.isRunning()) return;
	if (tempDisable.isRunning()) return;

	string comp = getPrivateString(getSkinName(), "Hidden Component", "Media Library");
	setPrivateString(getSkinName(), "Component", comp);

	int sh = getPrivateInt(getSkinName(), "nomax_h", 600);
	if (sh < 492) sh = 492;

	normal.sendAction("sui", "fromnocomp", 0,0,0,0);
	normal_resizer.setXmlParam("resize", "bottomright");
	normal_resizer2.setXmlParam("resize", "bottomleft");
	normal_resizer3.setXmlParam("resize", "bottom");
	normal_resizer4.setXmlParam("resize", "bottom");
	normal_TBresizer.setXmlParam("resize", "topright");
	normal_TBresizer2.setXmlParam("resize", "topleft");
	normal_TBresizer3.show();
	normal.setXmlParam("minimum_h" , "492");
	double d_scale = normal.getScale();
	normal.beforeRedock();
	if (getPrivateInt(getSkinName(), "isMainWndMaximized", 0)) normal.resize(getViewPortLeft(),getViewPortTop(),getViewPortWidth()/d_scale, getViewPortHeight()/d_scale);
	else 
	{
		if (collapse_bottom_attrib.getdata() == "1")
		{
			int sy = normal.getGuiY() + normal.getGuiH() - sh;
			if (sy < 0) sy = 0;
			normal.setXmlParam("y" , integerToString(sy));			
		}
		normal.setXmlParam("h" , integerToString(sh));
	}
	normal.redock();
	loadSUI (comp);

	onShowSUI();
}

tempDisable.onTimer()
{
	tempDisable.stop();
}

showMl()
{
	debugString(DEBUG_PREFIX "showMl() {", D_NWTF);

	showing_ml = 1;
	setPrivateString(getSkinName(), "Component", "Media Library");
	GuiObject o = sui_ml;
	if (o != NULL)
	{ 
		bypasscancel = 1;
		if (o) o.show();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   --> ok", D_NWTF);
	}
#ifdef DEBUG
	else
	{
		debugString(DEBUG_PREFIX "   -->  (!)  ml object not provided (show)", D_NWTF);
	}
#endif
	onShowMl();
	showing_ml = 0;

	debugString(DEBUG_PREFIX "}", D_NWTF);
}

hideMl()
{
	debugString(DEBUG_PREFIX "hideMl() {", D_NWTF);

	callback_showing_ml = 0;

	hiding_ml = 1;
	GuiObject o = sui_ml;
	if (o != NULL) { 
		bypasscancel = 1;
		if (o) o.hide();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   -->  ok", D_NWTF);
	}
#ifdef DEBUG
	else
	{
		debugString(DEBUG_PREFIX "   -->  (!)  ml object not provided (hide)", D_NWTF);
	}
#endif
	onHideMl();
	hiding_ml = 0;

	debugString(DEBUG_PREFIX "}", D_NWTF);
}

showVis()
{
	debugString(DEBUG_PREFIX "vis_inbig_attrib = " + vis_inbig_attrib.getData(), D_NWTF);
	if (vis_inbig_attrib.getData() == "1")
	{
		debugString(DEBUG_PREFIX "showVis() {", D_NWTF);


		showing_vis = 1;
		setPrivateString(getSkinName(), "Component", "Vis");
		GuiObject o = sui_vis;
		if (o != NULL)
		{ 
			bypasscancel = 1;
			if (o) o.show();
			bypasscancel = 0;
			debugString(DEBUG_PREFIX "   --> ok", D_NWTF);
		}
#ifdef DEBUG
		else
		{
			debugString(DEBUG_PREFIX "   -->  (!)  vis object not provided (show)", D_NWTF);
		}
#endif
		onShowVis();
		showing_vis = 0;

		debugString(DEBUG_PREFIX "}", D_NWTF);
	}
}

hideVis()
{
	debugString(DEBUG_PREFIX "vis_inbig_attrib = " + vis_inbig_attrib.getData(), D_NWTF);
	debugString(DEBUG_PREFIX "hideVis() {", D_NWTF);

	callback_showing_vis = 0;

	hiding_vis = 1;
	GuiObject o = sui_vis;
	if (o != NULL) { 
		bypasscancel = 1;
		if (o) o.hide();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   -->  ok", D_NWTF);
	}
#ifdef DEBUG
	else
	{
		debugString(DEBUG_PREFIX "   -->  (!)  vis object not provided (hide)", D_NWTF);
	}
#endif
	onHideVis();
	hiding_vis = 0;

	debugString(DEBUG_PREFIX "}", D_NWTF);
}

showVideo()
{
	debugString(DEBUG_PREFIX "showVideo() {", D_NWTF);

	showing_video = 1;
	setPrivateString(getSkinName(), "Component", "Video");
	GuiObject o = sui_video;
	if (o != NULL)
	{ 
		bypasscancel = 1;
		if (o) o.show();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   --> ok", D_NWTF);
	}
#ifdef DEBUG
	else
	{
		debugString(DEBUG_PREFIX "   -->  (!)  video object not provided (show)", D_NWTF);
	}
 #endif
	onShowVideo();
	showing_video = 0;

	debugString(DEBUG_PREFIX "}", D_NWTF);
}

hideVideo()
{
	debugString(DEBUG_PREFIX "hideVideo() {", D_NWTF);

	//callback_showing_video = 0;

	hiding_video = 1;
	GuiObject o = sui_video;
	if (o != NULL) { 
		bypasscancel = 1;
		if (o) o.hide();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   -->  ok", D_NWTF);
	}
#ifdef DEBUG
	else
	{
		debugString(DEBUG_PREFIX "   -->  (!)  video object not provided (hide)", D_NWTF);
	}
#endif
	onHideVideo();
	hiding_video = 0;

	debugString(DEBUG_PREFIX "}", D_NWTF);
}

showBrw()
{
	debugString(DEBUG_PREFIX "showBrw() {", D_NWTF);

	showing_brw = 1;
	setPrivateString(getSkinName(), "Component", "Browser");
	GuiObject o = sui_brw;
	if (o != NULL)
	{ 
		bypasscancel = 1;
		if (o) o.show();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   --> ok", D_NWTF);
	}
#ifdef DEBUG
	else
	{
		debugString(DEBUG_PREFIX "   -->  (!)  brw object not provided (show)", D_NWTF);
	}
#endif
	onShowBrw();

	mychange = 1;
	sui_browser_attrib.setData("1");
	mychange = 0;

	showing_brw = 0;

	debugString(DEBUG_PREFIX "}", D_NWTF);
}

hideBrw()
{
	debugString(DEBUG_PREFIX "hideBrw() {", D_NWTF);

	callback_showing_brw = 0;

	hiding_brw = 1;
	GuiObject o = sui_brw;
	if (o != NULL) { 
		bypasscancel = 1;
		if (o) o.hide();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   -->  ok", D_NWTF);
	}
#ifdef DEBUG
	else
	{
		debugString(DEBUG_PREFIX "   -->  (!)  brw object not provided (hide)", D_NWTF);
	}
#endif
	onHideBrw();
	hiding_brw = 0;

	mychange = 1;
	sui_browser_attrib.setData("0");
	mychange = 0;

	debugString(DEBUG_PREFIX "}", D_NWTF);
}
/*--
showExp()
{
	debugString(DEBUG_PREFIX "showExp() {", D_NWTF);

	showing_exp = 1;
	setPrivateString(getSkinName(), "Component", "Explorer");
	GuiObject o = sui_exp;
	if (o != NULL)
	{ 
		bypasscancel = 1;
		if (o) o.show();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   --> ok", D_NWTF);
	}
#ifdef DEBUG
	else
	{
		debugString(DEBUG_PREFIX "   -->  (!)  exp object not provided (show)", D_NWTF);
	}
#endif
	onShowExp();
	showing_exp = 0;

	mychange = 1;
	sui_explorer_attrib.setData("1");
	mychange = 0;

	debugString(DEBUG_PREFIX "}", D_NWTF);
}

hideExp()
{
	debugString(DEBUG_PREFIX "hideExp() {", D_NWTF);

	callback_showing_exp = 0;

	hiding_exp = 1;
	GuiObject o = sui_exp;
	if (o != NULL) { 
		bypasscancel = 1;
		if (o) o.hide();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   -->  ok", D_NWTF);
	}
#ifdef DEBUG
	else
	{
		debugString(DEBUG_PREFIX "   -->  (!)  exp object not provided (hide)", D_NWTF);
	}
#endif
	onHideExp();
	hiding_exp = 0;

	mychange = 1;
	sui_explorer_attrib.setData("0");
	mychange = 0;

	debugString(DEBUG_PREFIX "}", D_NWTF);
}--*/
/*--
showCfg()
{
	debugString(DEBUG_PREFIX "showCfg() {", D_NWTF);

	showing_Cfg = 1;
	setPrivateString(getSkinName(), "Component", "Config");
	GuiObject o = sui_Cfg;
	if (o != NULL)
	{ 
		bypasscancel = 1;
		if (o) o.show();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   --> ok", D_NWTF);
	}
#ifdef DEBUG
	else
	{
		debugString(DEBUG_PREFIX "   -->  (!)  Cfg object not provided (show)", D_NWTF);
	}
#endif
	onShowCfg();
	showing_Cfg = 0;

	mychange = 1;
	sui_Config_attrib.setData("1");
	mychange = 0;

	debugString(DEBUG_PREFIX "}", D_NWTF);
}

hideCfg()
{
	debugString(DEBUG_PREFIX "hideCfg() {", D_NWTF);

	callback_showing_cfg = 0;

	hiding_Cfg = 1;
	GuiObject o = sui_Cfg;
	if (o != NULL) { 
		bypasscancel = 1;
		if (o) o.hide();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   -->  ok", D_NWTF);
	}
#ifdef DEBUG
	else
	{
		debugString(DEBUG_PREFIX "   -->  (!)  Cfg object not provided (hide)", D_NWTF);
	}
#endif
	onHideCfg();
	hiding_Cfg = 0;

	mychange = 1;
	sui_config_attrib.setData("0");
	mychange = 0;

	debugString(DEBUG_PREFIX "}", D_NWTF);
}
--*/
callbackTimer.onTimer()
{
	callbackTimer.stop();

	int _callback_showing_vis = callback_showing_vis;
	int _callback_hiding_vis = callback_hiding_vis;
	int _callback_showing_video = callback_showing_video;
	int _callback_hiding_video = callback_hiding_video;
	int _callback_showing_ml = callback_showing_ml;
	int _callback_hiding_ml = callback_hiding_ml;
	//--int _callback_showing_exp = callback_showing_exp;
	//--int _callback_hiding_exp = callback_hiding_exp;
	int _callback_showing_brw = callback_showing_brw;
	int _callback_hiding_brw = callback_hiding_brw;
	//--int _callback_showing_cfg = callback_showing_cfg;
	//--int _callback_hiding_cfg = callback_hiding_cfg;
	int _callback_showing_sui = callback_showing_sui;
	int _callback_closing_sui = callback_closing_sui;

	callback_showing_vis = 0;
	callback_hiding_vis = 0;
	callback_showing_video = 0;
	callback_hiding_video = 0;
	callback_showing_ml = 0;
	callback_hiding_ml = 0;
	//--callback_showing_exp = 0;
	//--callback_hiding_exp = 0;
	callback_showing_brw = 0;
	callback_hiding_brw = 0;
	//--callback_showing_cfg = 0;
	//--callback_hiding_cfg = 0;

	callback_showing_sui = 0;
	callback_closing_sui = 0;

	if (_callback_showing_ml == 1)
	{
		showMl();
	}
	if (_callback_hiding_ml == 1)
	{
		hideMl();
	}
	if (_callback_showing_video == 1)
	{
		showVideo();
	}
	if (_callback_showing_vis == 1)
	{
		showVis();
	}
	if (_callback_hiding_vis == 1)
	{
		hideVis();
	}
	if (_callback_hiding_video == 1)
	{
		hideVideo();
	}/*--
	if (_callback_showing_exp == 1)
	{
		showExp();
	}
	if (_callback_hiding_exp == 1)
	{
		hideExp();
	}--*/
	if (_callback_showing_brw == 1)
	{
		showBrw();
	}
	if (_callback_hiding_brw == 1)
	{
		hideBrw();
	}
	/*--if (_callback_showing_cfg == 1)
	{
		showCfg();
	}
	if (_callback_hiding_cfg == 1)
	{
		hideCfg();
	}--*/
	if (_callback_showing_SUI == 1)
	{
		switchFromNoComp();
	}
	if (_callback_closing_SUI == 1)
	{
		switchToNoComp();
	}
}

dc_showMl()
{
	callback_showing_ml = 1;
	callback_hiding_ml = 0;
	callbackTimer.start();
}

dc_hideMl()
{
	callback_showing_ml = 0;
	callback_hiding_ml = 1;
	callbackTimer.start();
}

dc_showVideo()
{
	callback_showing_video = 1;
	callback_hiding_video = 0;
	callbackTimer.start();
}

dc_showVis()
{
	callback_showing_vis = 1;
	callback_hiding_vis = 0;
	callbackTimer.start();
}

dc_hideVideo()
{
	callback_showing_video = 0;
	callback_hiding_video = 1;
	callbackTimer.start();
}

dc_hideVis()
{
	callback_showing_vis = 0;
	callback_hiding_vis = 1;
	callbackTimer.start();
}

dc_showBrw()
{
	callback_showing_brw = 1;
	callback_hiding_brw = 0;
	callbackTimer.start();
}

dc_hideBrw()
{
	callback_showing_brw = 0;
	callback_hiding_brw = 1;
	callbackTimer.start();
}
/*--
dc_showExp()
{
	callback_showing_exp = 1;
	callback_hiding_exp = 0;
	callbackTimer.start();
}

dc_hideExp()
{
	callback_showing_exp = 0;
	callback_hiding_exp = 1;
	callbackTimer.start();
}
--*/
/*--dc_showCfg()
{
	callback_showing_cfg = 1;
	callback_hiding_cfg = 0;
	callbackTimer.start();
}

dc_hideCfg()
{
	callback_showing_cfg = 0;
	callback_hiding_cfg = 1;
	callbackTimer.start();
}--*/

dc_showSUI()
{
	callback_showing_sui = 1;
	callback_closing_sui = 0;
	callbackTimer.start();
}

dc_closeSUI()
{
	callback_showing_sui = 0;
	callback_closing_sui = 1;
	callbackTimer.start();
}