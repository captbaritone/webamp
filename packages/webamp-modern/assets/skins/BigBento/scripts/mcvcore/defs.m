/*---------------------------------------------------
-----------------------------------------------------
Filename:	defs.m
Version:	1.0

Type:		maki
Date:		08. Jun. 2007 - 23:32 
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


Function _##CURR_COMP##_switchTo();
Function _##CURR_COMP##_show();
Function _##CURR_COMP##_hide();

Function _##CURR_COMP##_onHide();
Function _##CURR_COMP##_onShow();

Function _##CURR_COMP##_dc_show();
Function _##CURR_COMP##_dc_hide();

Global Group _##CURR_COMP##_sui;
Global Boolean _##CURR_COMP##_callback_hiding, _##CURR_COMP##_callback_showing;
Global Boolean _##CURR_COMP##_showing, _##CURR_COMP##_hiding;



_##CURR_COMP##_show()
{
	debugString(DEBUG_PREFIX "_##CURR_COMP##_show() {", D_WTF);

	_##CURR_COMP##_showing = 1;
	GuiObject o = _##CURR_COMP##_sui;
	if (o != NULL)
	{ 
		bypasscancel = 1;
		if (o) o.show();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   --> ok", D_WTF);
	}
#ifdef DEBUG
	else debugString(DEBUG_PREFIX "   -->  (!)  ##CURR_COMP## object not provided (show)", D_WTF);
#endif
	_##CURR_COMP##_onShow();
	_##CURR_COMP##_showing = 0;

	debugString(DEBUG_PREFIX "}", D_WTF);
}

_##CURR_COMP##_hide()
{
	debugString(DEBUG_PREFIX "_##CURR_COMP##_hide() {", D_WTF);

	_##CURR_COMP##_hiding = 1;
	GuiObject o = _##CURR_COMP##_sui;
	if (o != NULL) { 
		bypasscancel = 1;
		if (o) o.hide();
		bypasscancel = 0;
		debugString(DEBUG_PREFIX "   -->  ok", D_WTF);
	}
#ifdef DEBUG
	else debugString(DEBUG_PREFIX "   -->  (!)  ##CURR_COMP## object not provided (hide)", D_WTF);
#endif
	_##CURR_COMP##_onHide();
	_##CURR_COMP##_hiding = 0;

	debugString(DEBUG_PREFIX "}", D_WTF);
}

_##CURR_COMP##_dc_show ()
{
	debugString(DEBUG_PREFIX "_##CURR_COMP##__dc_show();", D_WTF);
	_##CURR_COMP##_callback_showing = 1;
	_##CURR_COMP##_callback_hiding = 0;
	callbackTimer.start();
}

_##CURR_COMP##_dc_hide()
{
	_##CURR_COMP##_callback_showing = 0;
	_##CURR_COMP##_callback_hiding = 1;
	callbackTimer.start();
}

_##CURR_COMP##_onShow() {}
_##CURR_COMP##_onHide() {}