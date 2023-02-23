/*---------------------------------------------------
-----------------------------------------------------
Filename:	songinfo.m
Version:	1.0

Type:		maki
Date:		20. Nov. 2006 - 22:47 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>
#include attribs/init_appearance.m

Class Layer LinkedLayer;

Function initLL(linkedLayer l);
Function fadeLL(linkedLayer l, boolean in);
Function setLL(linkedLayer l, boolean in);

Global Group MenuBar;
Global button goPro;
Global GuiObject mousetrap;
Global Int texth;

Global LinkedLayer _play, _options, _file, _view, _help, _pro;
Global int xpos;

Global guiObject titlebargrid;


System.onScriptLoaded()
{
	initAttribs_Appearance();
	MenuBar = getscriptgroup().findobject("player.mainmenu");
	xpos = 0;

	titlebargrid = getScriptGroup().findObject("titlebar.grid.right");

	_file = MenuBar.getObject("menu.text.file");
	initLL(_file);

	_play = MenuBar.getObject("menu.text.play");
	initLL(_play);

	_options = MenuBar.getObject("menu.text.options");
	initLL(_options);

	_view = MenuBar.getObject("menu.text.view");
	initLL(_view);

	_help = MenuBar.getObject("menu.text.help");
	initLL(_help);

	goPro = Menubar.getObject("GoPro.menu");
	_pro = MenuBar.getObject("menu.text.pro");
	initLL(_pro);

	mousetrap = MenuBar.findObjecT("menu.hidden.mousetrap");

	texth = _file.getGuiH();

	if (system.isProVersion())
	{
		goPro.setXmlParam("ghost", "1");
		_pro.hide();
	}

	if (menubar_main_attrib.getData() == "1")
	{
		_options.setXmlParam("h", integerToString(texth));
		_file.setXmlParam("h", integerToString(texth));
		_pro.setXmlParam("h", integerToString(texth));
		_help.setXmlParam("h", integerToString(texth));
		_view.setXmlParam("h", integerToString(texth));
		_play.setXmlParam("h", integerToString(texth));
		mousetrap.hide();
//		MenuBar.setXmlParam("ghost", "0");
	}
	else
	{
		_options.setXmlParam("h", "0");
		_file.setXmlParam("h", "0");
		_pro.setXmlParam("h", "0");
		_help.setXmlParam("h", "0");
		_view.setXmlParam("h", "0");
		_play.setXmlParam("h", "0");
		mousetrap.show();
//		MenuBar.setXmlParam("ghost", "1");
	}
}

/*-- not implemented yet
system.onChangeProVersion(boolean ispro)
{
	if (ispro)
	{
		goPro.setXmlParam("ghost", "1");
		MenuText.setXmlParam("image", "window.titlebar.menu.text2");
		MenuText.setXmlParam("w", wnopro);
	}
	else
	{
		goPro.setXmlParam("ghost", "0");
		MenuText.setXmlParam("image", "window.titlebar.menu.text");
		MenuText.setXmlParam("w", wispro);
	}	
}
--*/

menubar_main_attrib.onDataChanged() {
	if (getData() == "1")
	{
		mousetrap.hide();
		fadeLL(_play, 1);
		fadeLL(_view, 1);
		fadeLL(_help, 1);
		fadeLL(_file, 1);
		fadeLL(_options, 1);
		fadeLL(_pro, 1);
	}
	else
	{
		mousetrap.show();
		fadeLL(_play, 0);
		fadeLL(_view, 0);
		fadeLL(_help, 0);
		fadeLL(_file, 0);
		fadeLL(_options, 0);
		fadeLL(_pro, 0);
	}
}
/*
System.onKeyDown(String k) {
	if (menubar_main_attrib.getData() == "0") return;
	Layout l = getScriptGroup().getParentLayout();
	if (!l.isActive()) return;
	if (k == "alt+f")
	{
		MenuBar.findObject("file.menu").sendAction("open", "", 0, 0, 0, 0);
		complete;
	}
	if (k == "alt+p")
	{
		MenuBar.findObject("play.menu").sendAction("open", "", 0, 0, 0, 0);
		complete;
	}
	if (k == "alt+o")
	{
		MenuBar.findObject("options.menu").sendAction("open", "", 0, 0, 0, 0);
		complete;
	}
	if (k == "alt+i")
	{
		MenuBar.findObject("view.menu").sendAction("open", "", 0, 0, 0, 0);
		complete;
	}
	if (k == "alt+h")
	{
		MenuBar.findObject("help.menu").sendAction("open", "", 0, 0, 0, 0);
		complete;
	}
	if (k == "alt")
	{
		MenuBar.findObject("file.menu").sendAction("preopen", "", 0, 0, 0, 0);
		complete;
	}
}
*/

System.onAccelerator(String action, String section, String key) {
	if (menubar_main_attrib.getData() == "0") return;
	//if (section != "main") return;
	
	Layout l = getScriptGroup().getParentLayout();
	if (!l.isActive()) return;
	if (action == "MENUHOTKEY_FILE")
	{
		MenuBar.findObject("file.menu").sendAction("open", "", 0, 0, 0, 0);
		complete;
	}
	if (action == "MENUHOTKEY_PLAY")
	{
		MenuBar.findObject("play.menu").sendAction("open", "", 0, 0, 0, 0);
		complete;
	}
	if (action == "MENUHOTKEY_OPTIONS")
	{
		MenuBar.findObject("options.menu").sendAction("open", "", 0, 0, 0, 0);
		complete;
	}
	if (action == "MENUHOTKEY_VIEW")
	{
		MenuBar.findObject("view.menu").sendAction("open", "", 0, 0, 0, 0);
		complete;
	}
	if (action == "MENUHOTKEY_HELP")
	{
		MenuBar.findObject("help.menu").sendAction("open", "", 0, 0, 0, 0);
		complete;
	}
}

goPro.onLeftClick ()
{
	if (isKeyDown(VK_ALT) && isKeyDown(VK_SHIFT) && isKeyDown(VK_CONTROL))
	{
		goPro.setXmlParam("ghost", "1");
		_pro.hide();
		return;
	}
	
	goPro.getParentlayout().getObject("sui.content").sendAction("browser_navigate", "http://www.winamp.com/buy", 0,0,0,0);
}


initLL (LinkedLayer l)
{
	int w = l.getAutoWidth();
	String id = getToken(l.getId(), ".", 2);
	if (l == _pro)
	{
		l.setXmlParam("x", integerToString(xpos));
		goPro.setXmlParam("w", integerToString(w));
		goPro.setXmlParam("x", integerToString(xpos));
		xpos += w;
		MenuBar.setXmlParam("w", integerToString(xpos));
		xpos += MenuBar.getGuiX();
		titlebargrid.setXmlParam("w", integerToString(-xpos));
		titlebargrid.setXmlParam("x", integerToString(xpos));
		return;
	}
	else
	{
		GuiObject o;

		o = MenuBar.findObject("menu.layer." + id + ".normal");
		if (o) o.setXmlParam("w", integerToString(w));
		if (o) o.setXmlParam("x", integerToString(xpos));

		o = MenuBar.findObject("menu.layer." + id + ".hover");
		if (o) o.setXmlParam("w", integerToString(w));
		if (o) o.setXmlParam("x", integerToString(xpos));

		o = MenuBar.findObject("menu.layer." + id + ".down");
		if (o) o.setXmlParam("w", integerToString(w));
		if (o) o.setXmlParam("x", integerToString(xpos));

		// Martin> I hate the Menu Object is not instanciable, perhaps i will fix this...
		// Martin> ...is fixed, yay!
		Menu m = MenuBar.findObject(id + ".menu");
		if (m) m.setXmlParam("w", integerToString(w));
		if (m) m.setXmlParam("x", integerToString(xpos));
		
	}
	l.setXmlParam("x", integerToString(xpos));
	xpos += w;
}

fadeLL (linkedLayer l, boolean in)
{
	l.cancelTarget();
	l.setTargetH(texth*in);
	l.setTargetSpeed(0.5);
	l.gotoTarget();
}